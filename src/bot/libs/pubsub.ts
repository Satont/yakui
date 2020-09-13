import { PubSubClient } from 'twitch-pubsub-client'
import { info } from './logger'
import tmi from './tmi'
import { onRedemption } from './eventsCaller'
import Settings from '@bot/models/Settings'

export default new class PubSub {
  client: PubSubClient = null

  async init() {
    if (!tmi.clients.broadcaster) return
    if (this.client) this.client = null
    this.client = new PubSubClient()
    await this.client.registerUserListener(tmi.clients.broadcaster)
    this.listeners()
  }

  async listeners() {
    await this.client.onRedemption(tmi.channel.id, onRedemption)
    info('PUBSUB: SUCCESSFULY SUBSCRIBED TO REDEMPTION EVENTS')
  }

  listenDbUpdates() {
    Settings.afterCreate(value => {
      if (value.space !== 'oauth') return

      setTimeout(() => this.init(), 5000)
    })
  }
}
