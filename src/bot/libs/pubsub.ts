import { PubSubClient } from 'twitch-pubsub-client'
import { error, info } from './logger'
import tmi from './tmi'
import { onRedemption } from './eventsCaller'
import Settings from '@bot/models/Settings'

export default new class PubSub {
  client: PubSubClient = null

  async init() {
    if (!tmi.clients.broadcaster) return
    
    const hasNeededScope = (await tmi.clients.broadcaster.getTokenInfo()).scopes.includes('channel:read:redemptions')
    if (!hasNeededScope) {
      info(`PUBSUB: Broadcaster hasn't channel:read:redemptions scope for listening redemptions`)
      return
    }

    if (this.client) this.client = null

    this.client = new PubSubClient()
    try {
      await this.client.registerUserListener(tmi.clients.broadcaster)
      this.listeners()
    } catch (e) {
      error('PUBSUB: ' + e)
    }
  }

  async listeners() {
    try {
      await this.client.onRedemption(tmi.channel.id, onRedemption)
      info('PUBSUB: SUCCESSFULY SUBSCRIBED TO REDEMPTION EVENTS')
    } catch (e) {
      error('PUBSUB: ' + e)
    }
  }

  listenDbUpdates() {
    Settings.afterCreate(value => {
      if (value.space !== 'oauth') return

      setTimeout(() => this.init(), 5000)
    })
  }
}
