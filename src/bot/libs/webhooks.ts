import tmi from "./tmi"
import Settings from '../models/Settings'
import { info, error } from "./logger"


export default new class WebHooks {
  private callBackUrl: string = null
  private validityInSeconds = 864000
  private initTimeout: NodeJS.Timeout = null

  constructor() {
    this.listenDbUpdates()
    this.init()
  }

  async init() {
    clearTimeout(this.initTimeout) 
    const url: Settings = await Settings.findOne({ where: { space: 'general', name: 'siteUrl' } })
    if (!url) return

    this.callBackUrl = `${url.value}/twitch/webhooks/callback`

    this.unsubscribe('follows').then(() => this.subscribe('follows'))
    this.unsubscribe('streams').then(() => this.subscribe('streams'))
    this.unsubscribe('moderator').then(() => this.subscribe('moderator'))

    setTimeout((() => this.init()), this.validityInSeconds * 1000)
  }

  async unsubscribe(type: 'follows' | 'streams' | 'moderator') {
    const channelId = tmi.channel.id

    const options = {
      callbackUrl: this.callBackUrl,
      validityInSeconds: this.validityInSeconds
    }
    try {
      switch (type) {
        case 'follows':
          await tmi.clients.bot.helix.webHooks.unsubscribeFromUserFollowsTo(channelId, options)
        break;
        case 'streams':
          await tmi.clients.bot.helix.webHooks.unsubscribeFromStreamChanges(channelId, options)
        break;
        case 'moderator':
          await tmi.clients.bot.helix.webHooks.unsubscribeFromModeratorEvents(channelId, options)
        break;
      }
      info(`WEBHOOKS: Unsibscribed from ${type} topic, ${tmi.channel.name} [${tmi.channel.id}`)
    } catch (e) {
      error(e)
    }
    return true
  }

  async subscribe(type: 'follows' | 'streams' | 'moderator') {
    const channelId = tmi.channel.id

    const options = {
      callbackUrl: this.callBackUrl,
      validityInSeconds: this.validityInSeconds
    }
    try {
      switch (type) {
        case 'follows':
          await tmi.clients.bot.helix.webHooks.subscribeToUserFollowsTo(channelId, options)
        break;
        case 'streams':
          await tmi.clients.bot.helix.webHooks.subscribeToStreamChanges(channelId, options)
        break;
        case 'moderator':
          await tmi.clients.bot.helix.webHooks.subscribeToModeratorEvents(channelId, options)
        break;
      }
      info(`WEBHOOKS: Subscribed to ${type} topic, ${tmi.channel.name} [${tmi.channel.id}]`)
    } catch (e) {
      error(e)
    }

    return true
  }

  listenDbUpdates() {
    Settings.afterUpdate(instance => {
      if (instance.space === 'general' && instance.name === 'siteUrl') {
        this.init()
      }
    })
  }
}