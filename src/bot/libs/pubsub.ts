import { PubSubClient } from 'twitch-pubsub-client'
import { info } from './logger'
import tmi from './tmi'
import { onRedemption } from './eventsCaller'

export default new class PubSub {
  client: PubSubClient = null

  constructor() {
    this.init()
  }

  async init() {
    this.client = new PubSubClient()
    await this.client.registerUserListener(tmi.clients.bot, tmi.channel.id)
    this.listeners()
  }

  async listeners() {
    await this.client.onRedemption(tmi.channel.id, onRedemption)
    info('PUBSUB: SUCCESSFULY SUBSCRIBED TO REDEMPTION EVENTS')
  }
}
