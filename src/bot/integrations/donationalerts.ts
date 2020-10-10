import Centrifuge from 'centrifuge'
import axios from 'axios'
import WebSocket from 'ws'

import { onDonation } from '@bot/libs/eventsCaller'
import currencyLib, { currency as currencyType } from '@bot/libs/currency'
import { User } from '@bot/entities/User'
import { UserTip } from '@bot/entities/UserTip'
import { error, info } from '@bot/libs/logger'
import { orm } from '@bot/libs/db'
import { onChange, settings } from '../decorators'

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

class Donationalerts {
  private centrifugeSocket: Centrifuge = null
  private channel: Centrifuge.Subscription = null
  private connecting = false
  private readonly audioRegular = /https:\/\/static\.donationalerts\.ru\/audiodonations[./\w]+/gm

  @settings()
  access_token: string = null

  @settings()
  refresh_token: string = null

  @settings()
  enabled = false

  @onChange(['enabled', 'access_token', 'refresh_token'])
  async onChanges() {
    this.disconnect()
    if (!this.enabled || !this.access_token || !this.refresh_token) return
    if (this.connecting) return
    await this.recheckToken()
    this.connecting = true

    if (!this.access_token || !this.refresh_token || !this.enabled) {
      this.connecting = false
      return
    }

    await this.connect()
  }

  async disconnect() {
    if (!this.centrifugeSocket || !this.channel) return
    this.channel.unsubscribe()
    this.centrifugeSocket.disconnect()
    this.centrifugeSocket = null
  }

  async recheckToken() {
    try {
      await axios.get('https://www.donationalerts.com/api/v1/user/oauth', {
        headers: { 'Authorization': `Bearer ${this.access_token}` },
      })
    } catch (e) {
      if (e.response?.status === 401) await this.refreshToken()
      else error(e)
    }
  }

  async refreshToken() {
    try {
      const { data } = await axios.get(`http://bot.satont.ru/api/donationalerts-refresh?refresh_token=${this.refresh_token}`)
      this.access_token = data.access_token
      this.refresh_token = data.refresh_token
  
      info('DONATIONALERTS: Token successfuly refreshed')
    } catch (e) {
      error('DONATIONALERTS: cannot refresh token')
    }
  }

  async connect() {
    this.disconnect()
    info('DONATIONALERTS: Starting connect')

    this.centrifugeSocket = new Centrifuge('wss://centrifugo.donationalerts.com/connection/websocket', {
      websocket: WebSocket,
      onPrivateSubscribe: async ({ data }, cb) => {
        const request = await axios.post('https://www.donationalerts.com/api/v1/centrifuge/subscribe', data, {
          headers: { 'Authorization': `Bearer ${this.access_token}` },
        })
        cb({ status: 200, data: { channels: request.data.channels } })
      },
    })

    const opts = await this.getOpts(this.access_token)

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
      this.onChanges()
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
      this.onChanges()
    })
    this.channel.on('unsubscribe', (reason) => {
      info(`DONATIONALERTS: unsibscribed from donations channel: ${reason}`)
      this.onChanges()
    })
    this.channel.on('publish', async ({ data }: { data: DonationAlertsEvent }) => {
      const user = await orm.em.fork().getRepository(User).findOne({ username: data.username.toLowerCase() })

      const message = data.message?.replace(this.audioRegular, '<audio>')

      const donationData = {
        userId: user?.id,
        amount: data.amount,
        currency: data.currency,
        rates: currencyLib.rates,
        inMainCurrencyAmount: currencyLib.exchange({ from: data.currency, amount: data.amount }),
        message,
        timestamp: Date.now(),
      }

      if (data.billing_system !== 'fake' && user) {
        const tip = orm.em.fork().getRepository(UserTip).create({
          ...donationData,
          user,
        })
        await orm.em.fork().getRepository(UserTip).persistAndFlush(tip)
      }

      onDonation({
        username: data.username?.trim() ?? 'Anonymous',
        userId: user?.id,
        amount: data.amount,
        currency: data.currency,
        inMainCurrencyAmount: currencyLib.exchange({ from: data.currency, amount: data.amount }),
        message,
        timestamp: Date.now(),
      })
    })
  }
}

export default new Donationalerts()
