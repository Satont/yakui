import Centrifuge from 'centrifuge'
import axios from 'axios'
import WebSocket from 'ws'

import { Integration } from 'typings'
import Settings from '@bot/models/Settings'
import { onDonation } from '@bot/libs/eventsCaller'
import currency, { currency as currencyType } from '@bot/libs/currency'
import User from '@bot/models/User'
import UserTips from '@bot/models/UserTips'
import { error, info } from '@bot/libs/logger'

type DonationAlertsEvent = {
  id: string;
  name: string;
  username: string;
  message: string;
  message_type: string;
  amount: number;
  currency: currencyType;
  billing_system: string;
}

export default new class Donationalerts implements Integration {
  centrifugeSocket: Centrifuge = null
  channel: Centrifuge.Subscription = null
  connecting = false

  async init() {
    if (this.connecting) return
    this.connecting = true
    const [access_token, refresh_token, enabled]: [Settings, Settings, Settings] = await Promise.all([
      Settings.findOne({
        where: { space: 'donationalerts', name: 'access_token' },
      }),
      Settings.findOne({
        where: { space: 'donationalerts', name: 'refresh_token' },
      }),
      Settings.findOne({
        where: { space: 'donationalerts', name: 'enabled' },
      }),
    ])

    if (!access_token?.value || !refresh_token?.value || !enabled?.value) {
      this.connecting = false
      return
    }

    this.recheckToken()
    this.connect()
  }

  async disconnect() {
    if (!this.centrifugeSocket) return
    this.channel.unsubscribe()
    this.centrifugeSocket.disconnect()
    this.centrifugeSocket = null
  }

  async recheckToken() {
    const [access_token, refresh_token]: [Settings, Settings] = await Promise.all([
      Settings.findOne({
        where: { space: 'donationalerts', name: 'access_token' },
      }),
      Settings.findOne({
        where: { space: 'donationalerts', name: 'refresh_token' },
      }),
    ])

    if (!access_token?.value || !refresh_token?.value) {
      return
    }

    try {
      await axios.get('https://www.donationalerts.com/api/v1/user/oauth', {
        headers: { 'Authorization': `Bearer ${access_token.value}` },
      })
    } catch (e) {
      if (e.response.status === 401) {
        const { data } = await axios.post(`http://bot.satont.ru/api/donationalerts-refresh?refresh_token=${refresh_token.value}`)
        access_token.value = data.access_token
        refresh_token.value = data.refresh_token
        await access_token.save()
        await refresh_token.save()
        info('DONATIONALERTS: Token successfuly refreshed')
      } else error(e)
    }

  }

  async connect() {
    let token = await Settings.findOne({
      where: { space: 'donationalerts', name: 'access_token' },
    })

    if (!token) throw 'DONATIONALERTS: token is empty'
    token = token.value

    this.disconnect()
    info('DONATIONALERTS: Starting init')

    this.centrifugeSocket = new Centrifuge('wss://centrifugo.donationalerts.com/connection/websocket', {
      websocket: WebSocket,
      onPrivateSubscribe: async ({ data }, cb) => {
        const request = await axios.post('https://www.donationalerts.com/api/v1/centrifuge/subscribe', data, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        cb({ status: 200, data: { channels: request.data.channels } })
      },
    })

    const opts = await this.getOpts(token)

    if (!opts) return

    this.centrifugeSocket.setToken(opts.token)
    this.centrifugeSocket.connect()
    this.listeners(opts)
    this.connecting = false
  }

  private async getOpts(token: string) {
    if (token.trim() === '') {
      throw new Error('Access token is empty.')
    }

    try {
      const request = await axios.get('https://www.donationalerts.com/api/v1/user/oauth', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      return {
        token: request.data.data.socket_connection_token,
        id: request.data.data.id,
      }
    } catch (e) {
      error('DONATIONALERTS: https://www.donationalerts.com/api/v1/user/oauth request failed: ' + e.message)
    }
  }

  async listeners(opts: { token: string, id: number }) {
    this.centrifugeSocket.on('disconnect', (reason: unknown) => {
      info('DONATIONALERTS: disconnected from socket: ', reason)
      this.init()
    })

    this.centrifugeSocket.on('connect', () => {
      info('DONATIONALERTS: successfuly connected to socket')
    })

    this.channel = this.centrifugeSocket.subscribe(`$alerts:donation_${opts.id}`)

    this.channel.on('join', () => {
      info('DONATIONALERTS: successfuly joined in donations channel')
    })
    this.channel.on('leaved', (reason) => {
      info('DONATIONALERTS: disconnected from donations channel: ', reason)
      this.init()
    })
    this.channel.on('unsubscribe', (reason) => {
      info('DONATIONALERTS: unsibscribed from donations channel: ', reason)
      this.init()
    })
    this.channel.on('publish', async ({ data }: { data: DonationAlertsEvent }) => {
      const user: User = await User.findOne({ where: { username: data.username.toLowerCase() }})

      const donationData = {
        userId: user?.id,
        amount: data.amount,
        currency: data.currency,
        rates: currency.rates,
        inMainCurrencyAmount: currency.exchange({ from: data.currency, amount: data.amount }),
        message: data.message,
        timestamp: Date.now(),
      }

      if (data.billing_system !== 'fake' && user) {
        await UserTips.create(donationData)
      }

      onDonation({
        username: data.username?.trim() ?? 'Anonymous',
        userId: user?.id,
        amount: data.amount,
        currency: data.currency,
        inMainCurrencyAmount: currency.exchange({ from: data.currency, amount: data.amount }),
        message: data.message,
        timestamp: Date.now(),
      })
    })
  }

  listenDbUpdates() {
    Settings.afterUpdate(instance => {
      if (instance.space === 'donationalerts') this.init()
    })
  }
}
