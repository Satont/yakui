import Twitch, { AccessToken } from 'twitch'
import Chat from 'twitch-chat-client'

import Settings from '@bot/models/Settings'
import OAuth from './oauth'
import Parser from './parser'
import { UserPermissions } from 'typings'
import events from '@bot/systems/events'
import { info, error, chatOut, chatIn, timeout, whisperOut } from './logger'
import { onHosting, onHosted, onRaided } from './eventsCaller'

export default new class Tmi {
  private isAlreadyUpdating = {
    bot: false,
    broadcaster: false,
  }

  clients: {
    broadcaster: Twitch | null,
    bot: Twitch | null,
  } = {
    broadcaster: null,
    bot: null,
  }
  chatClients: {
    broadcaster: Chat | null,
    bot: Chat | null,
  } = {
    broadcaster: null,
    bot: null,
  }
  connected: {
    bot: boolean,
    broadcaster: boolean,
  } = { 
    bot: false,
    broadcaster: false,
  }

  channel: { name: string, id: string }

  constructor() {
    this.connect('bot')
    this.connect('broadcaster')
  }

  async connect(type: 'bot' | 'broadcaster') {
    if (this.isAlreadyUpdating[type]) return;
    this.isAlreadyUpdating[type] = true

    const [accessToken, refreshToken, channel] = await Promise.all([
      Settings.findOne({ where: { space: 'oauth', name: `${type}AccessToken` } }),
      Settings.findOne({ where: { space: 'oauth', name: `${type}RefreshToken` } }),
      Settings.findOne({ where: { space: 'oauth', name: 'channel' } })
    ])

    if (!accessToken || !refreshToken || !channel) {
      this.isAlreadyUpdating[type] = false
      return
    }

    if (refreshToken.value === '') {
      this.isAlreadyUpdating[type] = false
      info(`TMI: refreshToken for ${type} not found, client will be not initiliazed.`)
      return
    }

    if (channel.value === '') {
      this.isAlreadyUpdating[type] = false
      error(`TMI (${type}): Channel not setted.`)
      return
    }

    info(`TMI: Starting initiliaze ${type} client`)

    try {
      await this.disconnect(type)

      const { clientId, scopes } = await OAuth.validate(accessToken?.value, type)

      this.clients[type] = Twitch.withCredentials(clientId, accessToken?.value, scopes)

      this.chatClients[type] = Chat.forTwitchClient(this.clients[type])

      this.listeners(type)
      if (type === 'bot') await this.getChannel(channel.value)
      await this.chatClients[type].connect()
      
      await this.intervaledUpdateAccessToken(type, { access_token: accessToken.value, refresh_token: refreshToken.value })
      this.loadLibs()
    } catch (e) {
      error(e)
      OAuth.refresh(refreshToken.value, type)
        .then(() => this.connect(type))
    } finally {
      this.isAlreadyUpdating[type] = false
    }
  }

  private async intervaledUpdateAccessToken(type: 'bot' | 'broadcaster', data) {
    const { access_token, refresh_token } = await OAuth.refresh(data.refresh_token, type)

    this.clients[type]._getAuthProvider().setAccessToken(new AccessToken({
      access_token: data.access_token,
      refresh_token: data.refresh_token
    }))

    setTimeout(() => this.intervaledUpdateAccessToken(type, { access_token, refresh_token }), 10 * 60 * 1000)
  }

  private async getChannel(name: string) {
    const user = await this.clients.bot?.helix.users.getUserByName(name)
    if (!user) return
    this.channel = { name: user.name, id: user.id }

    info(`TMI: Channel name: ${this.channel.name}, channelId: ${this.channel.id}`)
  }

  async disconnect(type: 'bot' | 'broadcaster') {
    const client = this.chatClients[type] 

    if (client) {
      client.part(this.channel?.name)
      client.quit()
  
      info(`TMI: ${type} disconnecting from server`)
      this.clients[type] = null
      this.chatClients[type] = null
    }
  }

  async listeners(type: 'bot' | 'broadcaster') {
    const client = this.chatClients[type]
    
    client.onDisconnect((manually, reason) => {
      info(`TMI: ${type} disconnected from server `, !manually ? reason.message : 'manually')
    })

    client.onConnect(() => {
      info(`TMI: ${type.charAt(0).toUpperCase() + type.substring(1)} client connected`)
      this.connected[type] = true
      client.join(this.channel?.name).catch((e) => {
        if (e.message.includes('Did not receive a reply to join')) return;
        else throw new Error(e)
      })
    })

    client.onJoin((channel) => {
      info(`TMI: Bot joined ${channel.replace('#', '')}`)
    })

    client.onPart((channel) => {
      info(`TMI: Bot parted ${channel.replace('#', '')}`)
    })

    if (type === 'bot') {
      client.onAction(async (channel, username, message, raw) => {
        chatIn(`${username} [${raw.userInfo.userId}]: ${message}`)

        (raw as any).isAction = true
        events.fire({ name: 'message', opts: { username, message } })
        await Parser.parse(message, raw)
      })
      client.onPrivmsg(async (channel, username, message, raw) => {
        chatIn(`${username} [${raw.userInfo.userId}]: ${message}`)

        if (raw.isCheer) {
          events.fire({ name: 'bits', opts: { amount: raw.totalBits, message }})
        } else {
          events.fire({ name: 'message', opts: { username, message } })
          await Parser.parse(message, raw)
        }
      })
      client.onHost((channel, username, viewers) => {
        onHosting({ username, viewers })
      })
      client.onHosted((channel, username, auto, viewers) => {
        onHosted({ username, viewers })
      })
      client.onRaid((channel, username, { viewerCount }) => {
        onRaided({ username, viewers: viewerCount })
      })
    }
  }

  async say({ type = 'bot', message }: { type?: 'bot' | 'broadcaster', message: string }) {
    this.chatClients[type]?.say(this.channel.name, message)
    chatOut(message)
  }

  async timeout({ username, duration, reason }: { username: string, duration: number, reason?: string }) {
    await this.chatClients.bot?.timeout(this.channel.name, username, duration, reason)
    timeout(`${username} | ${duration}s | ${reason ?? ''}`)
  }

  async whispers({ type = 'bot', message, target }: { type?: 'bot' | 'broadcaster', message: string, target: string }) {
    this.chatClients[type]?.whisper(target, message)
    whisperOut(`${target}: ${message}`)
  }

  getUserPermissions(badges: Map<string, string>): UserPermissions {
    return {
      broadcaster: badges.has('broadcaster'),
      moderators: badges.has('moderator'),
      vips: badges.has('vip'),
      subscribers: (badges.has('subscriber') || badges.has(('founder'))),
      viewers: true,
    }
  }

  listenDbUpdates() {
    Settings.afterSave((value => {
      if (value.space !== 'oauth') return;
      setTimeout(() => {
        this.connect('bot')
        this.connect('broadcaster')
      }, 5000)
    }))
  }

  private loadLibs() {
    import('@bot/systems/twitch')
    import('./loader')
    import('./currency')
    import('./webhooks')
  }
}
