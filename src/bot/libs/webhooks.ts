import tmi from './tmi'
import { Settings } from '@bot/entities/Settings'
import { info, error } from './logger'
import { orm } from './db'

export default new class WebHooks {
  private callBackUrl: string = null
  private validityInSeconds = 864000
  private initTimeout: NodeJS.Timeout = null

  constructor() {
    this.init()
  }

  async init() {
    clearTimeout(this.initTimeout)
    const url = await orm.em.getRepository(Settings).findOne({ space: 'general', name: 'siteUrl' })
    if (!url) return

    this.callBackUrl = `${url.value}/twitch/webhooks/callback`
    if (!tmi.channel?.id) return setTimeout(() => this.init(), 5000)
    this.unsubscribe('follows').then(() => this.subscribe('follows'))
    this.unsubscribe('streams').then(() => this.subscribe('streams'))
    this.unsubscribe('moderator').then(() => this.subscribe('moderator'))

    this.initTimeout = setTimeout((() => this.init()), this.validityInSeconds * 1000)
  }

  async unsubscribe(type: 'follows' | 'streams' | 'moderator') {
    const channelId = tmi.channel.id

    const options = {
      callbackUrl: this.callBackUrl,
      validityInSeconds: this.validityInSeconds,
    }

    if (!this.callBackUrl.startsWith('https')) return false

    try {
      switch (type) {
        case 'follows':
          await tmi.clients.bot.helix.webHooks.unsubscribeFromUserFollowsTo(channelId, options)
          break
        case 'streams':
          await tmi.clients.bot.helix.webHooks.unsubscribeFromStreamChanges(channelId, options)
          break
        case 'moderator':
          await tmi.clients.bot.helix.webHooks.unsubscribeFromModeratorEvents(channelId, options)
          break
      }
      info(`WEBHOOKS: Unsibscribed from ${type} topic, ${tmi.channel.name} [${tmi.channel.id}]`)
    } catch (e) {
      error(e)
    }

    return true
  }

  async subscribe(type: 'follows' | 'streams' | 'moderator') {
    const channelId = tmi.channel.id

    const options = {
      callbackUrl: this.callBackUrl,
      validityInSeconds: this.validityInSeconds,
    }

    if (!this.callBackUrl.startsWith('https')) return false

    try {
      switch (type) {
        case 'follows':
          await tmi.clients.bot.helix.webHooks.subscribeToUserFollowsTo(channelId, options)
          break
        case 'streams':
          await tmi.clients.bot.helix.webHooks.subscribeToStreamChanges(channelId, options)
          break
        case 'moderator':
          await tmi.clients.bot.helix.webHooks.subscribeToModeratorEvents(channelId, options)
          break
      }
      info(`WEBHOOKS: Subscribed to ${type} topic, ${tmi.channel.name} [${tmi.channel.id}]`)
    } catch (e) {
      error(e)
    }

    return true
  }
}
