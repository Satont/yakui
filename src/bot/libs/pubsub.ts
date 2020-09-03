import PubSubClient from 'twitch-pubsub-client'
import { info, error } from './logger'
import tmi from './tmi'
import events from '@bot/systems/events'
import { onRedemption } from './eventsCaller'

export default new class PubSub {
  client: PubSubClient = null

  constructor() {
    this.init()
  }

  async init() {
    this.client = new PubSubClient()
    await this.client.registerUserListener(tmi.clients.bot)
    this.listeners()
  }

  async listeners() {
    await this.client.onRedemption(tmi.channel.id, onRedemption)
  }

}
