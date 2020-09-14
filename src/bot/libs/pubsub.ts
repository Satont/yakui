import { PubSubClient } from 'twitch-pubsub-client'
import { error, info } from './logger'
import tmi from './tmi'
import { onRedemption } from './eventsCaller'
import Settings from '@bot/models/Settings'

export default new class PubSub {
  client: PubSubClient = null

  async init() {
    if (!tmi.clients.broadcaster) return
    if (this.client) this.client = null
    this.client = new PubSubClient()
    try {
      await this.client.registerUserListener(tmi.clients.broadcaster)
      this.listeners()
    } catch (e) {
      error('PUBSUB: ' + e.message)
    }
  }

  async listeners() {
    try {
      await this.client.onRedemption(tmi.channel.id, onRedemption)
      info('PUBSUB: SUCCESSFULY SUBSCRIBED TO REDEMPTION EVENTS')
    } catch (e) {
      error('PUBSUB: ' + e.message)
    }
  }

  listenDbUpdates() {
    Settings.afterCreate(value => {
      if (value.space !== 'oauth') return

      setTimeout(() => this.init(), 5000)
    })
  }
}
