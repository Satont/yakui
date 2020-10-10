import { ApiClient as Twitch, AccessToken } from 'twitch'
import{ ChatClient as Chat } from 'twitch-chat-client'
import { StaticAuthProvider } from 'twitch-auth'

import OAuth from './oauth'
import Parser from './parser'
import events from '@bot/systems/events'
import { info, error, chatOut, chatIn, timeout, whisperOut } from './logger'
import { onHosting, onHosted, onRaided, onSubscribe, onReSubscribe, onMessageHighlight } from './eventsCaller'
import { TwitchPrivateMessage } from 'twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage'
import oauth from './oauth'

export default new class Tmi {
  private intervals = {
    updateAccessToken: {
      bot: null,
      broadcaster: null,
    },
  }
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

  async init() {
    await this.connect('bot')
    await this.connect('broadcaster')
  }

  async connect(type: 'bot' | 'broadcaster') {
    if (this.isAlreadyUpdating[type]) return
    this.isAlreadyUpdating[type] = true

    if (!oauth.channel || !oauth[`${type}AccessToken`] || !oauth[`${type}RefreshToken`]) {
      this.isAlreadyUpdating[type] = false
      return
    }

    info(`TMI: Starting initiliaze ${type} client`)

    try {
      await this.disconnect(type)

      const { clientId, scopes } = await OAuth.validate(type)

      this.clients[type] = new Twitch({ authProvider: new StaticAuthProvider(clientId, oauth[`${type}AccessToken`], scopes) })

      this.chatClients[type] = new Chat(this.clients[type])

      this.listeners(type)
      if (type === 'bot') {
        await this.getChannel(oauth.channel)
        await import('./webhooks')
        await this.loadLibs()
      }
      await this.chatClients[type].connect()

      await this.intervaledUpdateAccessToken(type)
      if (type === 'broadcaster') {
        const pubsub = await import('./pubsub')
        await pubsub.default.init()
      }
    } catch (e) {
      error(e)
      await OAuth.refresh(type)
      this.isAlreadyUpdating[type] = false
    } finally {
      this.isAlreadyUpdating[type] = false
    }
  }

  private async intervaledUpdateAccessToken(type: 'bot' | 'broadcaster') {
    clearInterval(this.intervals.updateAccessToken[type])

    try {
      const { access_token, refresh_token } = await OAuth.refresh(type)
      const token = new AccessToken({ access_token, refresh_token })
    
      this.clients[type].setAccessToken(token)
      this.intervals.updateAccessToken[type] = setTimeout(() => this.intervaledUpdateAccessToken(type), 10 * 60 * 1000)
    } catch (e) {
      error(e)
    } finally {
      this.intervals.updateAccessToken[type] = setTimeout(() => this.intervaledUpdateAccessToken(type), 10 * 60 * 1000)
    }
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
      await client.quit()

      this.clients[type] = null
      this.chatClients[type] = null
    }
  }

  async listeners(type: 'bot' | 'broadcaster') {
    const client = this.chatClients[type]

    client.onDisconnect((manually, reason) => {
      info(`TMI: ${type} disconnected from server ${reason}`)
      this.connect(type)
    })

    client.onConnect(() => {
      info(`TMI: ${type.charAt(0).toUpperCase() + type.substring(1)} client connected`)
      this.connected[type] = true
      client.join(this.channel?.name).catch((e) => {
        if (e.message.includes('Did not receive a reply to join')) return
        else error(e)
      })
    })

    client.onJoin((channel) => {
      info(`TMI: Bot joined ${channel.replace('#', '')}`)
    })

    client.onPart((channel) => {
      info(`TMI: Bot parted ${channel.replace('#', '')}`)
    })

    if (type === 'bot') {
      client.onAnyMessage(msg => {
        if (msg.tags.get('msg-id') !== 'highlighted-message') return
        onMessageHighlight(msg as TwitchPrivateMessage)
      })
      client.onAction(async (channel, username, message, raw) => {
        chatIn(`${username} [${raw.userInfo.userId}]: ${message}`);

        (raw as any).isAction = true
        events.fire({ name: 'message', opts: { username, message } })
        Parser.parse(message, raw)
      })
      client.onMessage(async (channel, username, message, raw) => {
        chatIn(`${username} [${raw.userInfo.userId}]: ${message}`)

        if (raw.isCheer) {
          events.fire({ name: 'bits', opts: { amount: raw.totalBits, message } })
        } else {
          events.fire({ name: 'message', opts: { username, message } })
          Parser.parse(message, raw)
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
      client.onSub((channel, username, subInfo) => {
        const tier = isNaN(Number(subInfo.plan)) ? 'Twitch prime' : String(Number(subInfo.plan) / 1000)
        onSubscribe({ username, tier, isPrime: subInfo.isPrime, message: subInfo.message })
      })
      client.onResub((channel, username, subInfo) => {
        const tier = isNaN(Number(subInfo.plan)) ? 'Twitch prime' : String(Number(subInfo.plan) / 1000)
        onReSubscribe({ username, tier, message: subInfo.message, months: subInfo.streak, overallMonths: subInfo.months, isPrime: subInfo.isPrime })
      })
    }
  }

  async say({ type = 'bot', message }: { type?: 'bot' | 'broadcaster', message: string }) {
    if (process.env.NODE_ENV === 'production') this.chatClients[type]?.say(this.channel.name, message)
    chatOut(message)
  }

  async timeout({ username, duration, reason }: { username: string, duration: number, reason?: string }) {
    if (process.env.NODE_ENV === 'production') await this.chatClients.bot?.timeout(this.channel.name, username, duration, reason)
    timeout(`${username} | ${duration}s | ${reason ?? ''}`)
  }

  async whispers({ type = 'bot', message, target }: { type?: 'bot' | 'broadcaster', message: string, target: string }) {
    if (process.env.NODE_ENV === 'production') this.chatClients[type]?.whisper(target, message)
    whisperOut(`${target}: ${message}`)
  }

  private async loadLibs() {
    await import('./loader')
    await import('./currency')
  }
}
