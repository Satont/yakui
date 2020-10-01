import Centrifuge from 'centrifuge'
import axios from 'axios'
import WebSocket from 'ws'

import { Integration } from '@src/typings'
import { Settings } from '@bot/entities/Settings'
import { onDonation } from '@bot/libs/eventsCaller'
import currency, { currency as currencyType } from '@bot/libs/currency'
import { User } from '@bot/entities/User'
import { UserTip } from '@bot/entities/UserTip'
import { error, info } from '@bot/libs/logger'
import { orm } from '@bot/libs/db'

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
  private centrifugeSocket: Centrifuge = null
  private channel: Centrifuge.Subscription = null
  private connecting = false
  private readonly audioRegular = /https:\/\/static\.donationalerts\.ru\/audiodonations[./\w]+/gm

  async init() {
    if (this.connecting) return
    this.connecting = true
    const [access_token, refresh_token, enabled] = await Promise.all([
      orm.em.getRepository(Settings).findOne({ space: 'donationalerts', name: 'access_token' }),
      orm.em.getRepository(Settings).findOne({ space: 'donationalerts', name: 'refresh_token' }),
      orm.em.getRepository(Settings).findOne({ space: 'donationalerts', name: 'enabled' }),
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
    const [access_token, refresh_token] = await Promise.all([
      orm.em.getRepository(Settings).findOne({ space: 'donationalerts', name: 'access_token' }),
      orm.em.getRepository(Settings).findOne({ space: 'donationalerts', name: 'refresh_token' }),
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
        const { data } = await axios.get(`http://bot.satont.ru/api/donationalerts-refresh?refresh_token=${refresh_token.value}`)
        access_token.value = data.access_token
        refresh_token.value = data.refresh_token

        await orm.em.getRepository(Settings).persistAndFlush([access_token, refresh_token])

        info('DONATIONALERTS: Token successfuly refreshed')
      } else error(e.message)
    }

  }

  async connect() {
    const query = await orm.em.getRepository(Settings).findOne({ space: 'donationalerts', name: 'access_token' })

    if (!query) throw 'DONATIONALERTS: token is empty'
    const token = query.value

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
      info(`DONATIONALERTS: disconnected from socket: ${reason}`)
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
      info(`DONATIONALERTS: disconnected from donations channel: ${reason}`)
      this.init()
    })
    this.channel.on('unsubscribe', (reason) => {
      info(`DONATIONALERTS: unsibscribed from donations channel: ${reason}`)
      this.init()
    })
    this.channel.on('publish', async ({ data }: { data: DonationAlertsEvent }) => {
      const user = await orm.em.getRepository(User).findOne({ username: data.username.toLowerCase() })

      const message = data.message?.replace(this.audioRegular, '<audio>')

      const donationData = {
        userId: user?.id,
        amount: data.amount,
        currency: data.currency,
        rates: currency.rates,
        inMainCurrencyAmount: currency.exchange({ from: data.currency, amount: data.amount }),
        message,
        timestamp: Date.now(),
      }

      if (data.billing_system !== 'fake' && user) {
        const tip = orm.em.getRepository(UserTip).create({
          ...donationData,
          inMainCurrencyAmount: String(donationData.inMainCurrencyAmount),
          amount: String(donationData.amount),
        })
        await orm.em.getRepository(UserTip).persistAndFlush(tip)
      }

      onDonation({
        username: data.username?.trim() ?? 'Anonymous',
        userId: user?.id,
        amount: data.amount,
        currency: data.currency,
        inMainCurrencyAmount: currency.exchange({ from: data.currency, amount: data.amount }),
        message,
        timestamp: Date.now(),
      })
    })
  }
}
