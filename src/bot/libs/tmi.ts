import Twitch from 'twitch'
import Chat from 'twitch-chat-client'
import moment from 'moment'

import Settings from '../models/Settings'
import OAuth from './oauth'
import Parser from './parser'
import { UserPermissions } from '../../../typings'
import events from '../systems/events'

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
      throw `TMI: refreshToken for ${type} not found, client will be not initiliazed.`
    }

    if (channel.value === '') {
      this.isAlreadyUpdating[type] = false
      console.log(accessToken, refreshToken, channel)
      throw `TMI (${type}): Channel not setted.`
    }
  
    console.info(`TMI: Starting initiliaze ${type} client`)

    try {
      await this.disconnect(type)

      const { clientId, scopes } = await OAuth.validate(accessToken?.value, type)

      this.clients[type] = Twitch.withCredentials(clientId, accessToken?.value, scopes)

      this.chatClients[type] = Chat.forTwitchClient(this.clients[type])

      this.listeners(type)
      await this.getChannel(channel.value)
      await this.chatClients[type].connect()

    } catch (e) {
      console.log(e)
      OAuth.refresh(refreshToken.value, type)
        .then(() => this.connect(type))
    } finally {
      this.isAlreadyUpdating[type] = false
    }
  }

  private async getChannel(name: string) {
    const user = await this.clients.bot?.helix.users.getUserByName(name)
    if (!user) return
    this.channel = { name: user.name, id: user.id }

    console.log(`TMI: Channel name: ${this.channel.name}, channelId: ${this.channel.id}`)
  }

  async disconnect(type: 'bot' | 'broadcaster') {
    const client = this.chatClients[type] 

    if (client) {
      client.part(this.channel.name)
      client.quit()
  
      console.info(`TMI: ${type} disconnecting from server`)
      this.clients[type] = null
      this.chatClients[type] = null
    }
  }

  async listeners(type: 'bot' | 'broadcaster') {
    const client = this.chatClients[type]
    
    client.onDisconnect((manually, reason) => {
      console.info(`TMI: ${type} disconnected from server`, !manually ? reason.message : undefined)
    })

    client.onConnect(() => {
      console.info(`TMI: ${type.charAt(0).toUpperCase() + type.substring(1)} client connected`)
      this.connected[type] = true
      client.join(this.channel.name).catch((e) => {
        if (e.message.includes('Did not receive a reply to join')) return;
        else throw new Error(e)
      })
      if (type === 'bot') {
        import('./twitch')
        import('./loader')
      }
    })

    client.onJoin((channel) => {
      console.info(`TMI: Bot joined ${channel.replace('#', '')}`)
    })

    if (type === 'bot') {
      client.onAction(async (channel, username, message, raw) => {
        if (username === client.currentNick) {
          console.info(`${moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS')} <<< ${message}`)
        } else console.info(`${moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS')} >>> ${username}: ${message}`);
        (raw as any).isAction = true
        events.fire({ name: 'message', opts: { username, message } })
        await Parser.parse(message, raw)
      })
      client.onPrivmsg(async (channel, username, message, raw) => {
        if (raw.isCheer) {
          events.fire({ name: 'bits', opts: { amount: raw.totalBits, message }})
        } else {
          console.info(`${moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS')} >>> ${username}: ${message}`)
          events.fire({ name: 'message', opts: { username, message } })
          await Parser.parse(message, raw)
        }
      })
      client.onHost((channel, username, viewers) => {
        events.fire({ name: 'host', opts: { username, viewers } })
      })
      client.onHosted((channel, username, auto, viewers) => {
        events.fire({ name: 'hosted', opts: { username, viewers } })
      })
      client.onRaid((channel, username, { viewerCount }) => {
        events.fire({ name: 'raided', opts: { username, viewers: viewerCount } })
      })
    }
  }

  async say({ type = 'bot', message }: { type?: 'bot' | 'broadcaster', message: string }) {
    this.chatClients[type]?.say(this.channel.name, message)
    console.info(`${moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS')} <<< ${message}`)
  }

  async timeout({ username, duration, reason }: { username: string, duration: number, reason?: string }) {
    await this.chatClients.bot?.timeout(this.channel.name, username, duration, reason)
    console.info(`${moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS')} +timeout ${username} | ${duration}s | ${reason ?? ''}`)
  }

  async whispers({ type = 'bot', message, target }: { type?: 'bot' | 'broadcaster', message: string, target: string }) {
    this.chatClients[type]?.whisper(target, message)
    console.info(`${moment().format('YYYY-MM-DD[T]HH:mm:ss.SSS')} <<<W ${message}`)
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
}
