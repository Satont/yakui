import { PubSubClient, BasicPubSubClient } from 'twitch-pubsub-client'
import { error, info } from './logger'
import tmi from './tmi'
import { onRedemption } from './eventsCaller'

export default new class PubSub {
  basicPubSubClient: BasicPubSubClient = null

  async init() {
    if (!tmi.clients.broadcaster) return
    this.disconnect()

    const hasNeededScope = (await tmi.clients.broadcaster.getTokenInfo()).scopes.includes('channel:read:redemptions')
    if (!hasNeededScope) {
      info(`PUBSUB: Broadcaster hasn't channel:read:redemptions scope for listening redemptions`)
      return
    }

    this.basicPubSubClient = new BasicPubSubClient()
    const pubSubClient = new PubSubClient(this.basicPubSubClient)

    try {
      await pubSubClient.registerUserListener(tmi.clients.broadcaster)
      await pubSubClient.onRedemption(tmi.channel.id, onRedemption)

      info('PUBSUB: SUCCESSFULY SUBSCRIBED TO REDEMPTION EVENTS')
    } catch (e) {
      error('PUBSUB: ' + e)
    }
  }

  async disconnect() {
    if (!this.basicPubSubClient) return

    this.basicPubSubClient.disconnect()
    this.basicPubSubClient = null
  }
}
