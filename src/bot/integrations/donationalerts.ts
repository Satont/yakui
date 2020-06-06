import Centrifuge from 'centrifuge'
import axios from 'axios'
import WebSocket from 'ws'

import { Integration } from 'typings';
import Settings from '../models/Settings';
import { onDonation } from '../libs/eventsCaller'
import currency, { currency as currencyType } from '../libs/currency'
import User from '../models/User'
import UserTips from '../models/UserTips';

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
  socket: Centrifuge = null

  async init() {
    const [token, enabled]: [Settings, Settings] = await Promise.all([
      Settings.findOne({
        where: { space: 'donationalerts', name: 'access_token' }
      }),
      Settings.findOne({
        where: { space: 'donationalerts', name: 'enabled' }
      })
    ])

    if (!token || !enabled || !enabled?.value) return

    this.connect(token.value)
  }

  async connect(token: string) {
    if (!token.trim().length) throw 'DONATIONALERTS: token is empty'

    console.info('DONATIONALERTS: Starting init')

    if (this.socket) this.socket.disconnect()

    this.socket = new Centrifuge('wss://centrifugo.donationalerts.com/connection/websocket', {
      websocket: WebSocket,
      onPrivateSubscribe: async ({ data }, cb) => {
        const request = await axios.post('https://www.donationalerts.com/api/v1/centrifuge/subscribe', data, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        cb({ status: 200, data: { channels: request.data.channels } })
      },
    })

    const opts = await this.getOpts(token)

    this.socket.setToken(opts.token)
    this.socket.connect()

    this.listeners(opts)
  }

  private async getOpts(token: string) {
    if (token.trim() === '') {
      throw new Error('Access token is empty.');
    }

    const request = await axios.get('https://www.donationalerts.com/api/v1/user/oauth', {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    return {
      token: request.data.data.socket_connection_token,
      id: request.data.data.id,
    };
  }

  async listeners(opts: { token: string, id: number }) {
    this.socket.on('disconnect', (reason: unknown) => {
      console.info('DONATIONALERTS: disconnected from socket: ', reason)
    })
    
    this.socket.on('connect', () => {
      console.info('DONATIONALERTS: successfuly connected to socket')
    })

    const channel = this.socket.subscribe(`$alerts:donation_${opts.id}`)

    channel.on('join', () => {
      console.info('DONATIONALERTS: successfuly joined in donations channel')
    })
    channel.on('leaved', (reason) => {
      console.info('DONATIONALERTS: disconnected from donations channel: ', reason)
    })
    channel.on('leaved', (error) => {
      console.info('DONATIONALERTS: some error occured: ', error)
    })
    channel.on('unsubscribe', (reason) => {
      console.info('DONATIONALERTS: unsibscribed from donations channel: ', reason)
    })
    channel.on('publish', async ({ data }: { data: DonationAlertsEvent }) => {
      const user: User = await User.findOne({ where: { username: data.username.toLowerCase() }})

      const donationData = { 
        userId: user.id,
        amount: data.amount,
        currency: data.currency,
        rates: currency.rates,
        inMainCurrencyAmount: currency.exchange({ from: data.currency, amount: data.amount }),
        message: data.message,
        timestamp: Date.now()
      }
    
      if (data.billing_system !== 'fake' || !user) {
        await UserTips.create(donationData)
      }

      onDonation(data)
    })
  }

  listenDbUpdates() {
    Settings.afterUpdate(instance => {
      if (instance.space === 'donationalerts') this.init()
    })
  }
}