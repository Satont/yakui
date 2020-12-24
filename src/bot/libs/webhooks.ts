import tmi from './tmi'
import { info, error } from './logger'
import general from '../settings/general'

export default new class WebHooks {
  private callBackUrl: string = null
  private validityInSeconds = 864000
  private initTimeout: NodeJS.Timeout = null

  async init() {
    const url = general.siteUrl
    if (url.includes('localhost')) return

    this.callBackUrl = `${url}/twitch/webhooks/callback`
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
          await tmi.bot.api.helix.webHooks.unsubscribeFromUserFollowsTo(channelId, options)
          break
        case 'streams':
          await tmi.bot.api.helix.webHooks.unsubscribeFromStreamChanges(channelId, options)
          break
        case 'moderator':
          await tmi.bot.api.helix.webHooks.unsubscribeFromModeratorEvents(channelId, options)
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
          await tmi.bot.api.helix.webHooks.subscribeToUserFollowsTo(channelId, options)
          break
        case 'streams':
          await tmi.bot.api.helix.webHooks.subscribeToStreamChanges(channelId, options)
          break
        case 'moderator':
          await tmi.bot.api.helix.webHooks.subscribeToModeratorEvents(channelId, options)
          break
      }
      info(`WEBHOOKS: Subscribed to ${type} topic, ${tmi.channel.name} [${tmi.channel.id}]`)
    } catch (e) {
      error(e)
    }

    return true
  }
}
