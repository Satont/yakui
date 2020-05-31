import Twitch from 'twitch'
import Chat from 'twitch-chat-client'

import Settings from '../models/Settings'
import OAuth from './oauth'
import Parser from './parser'

export default new class Tmi {
  clients: {
    broadcaster: Twitch | null,
    bot: Twitch | null,
  }
  chatClients: {
    broadcaster: Chat | null,
    bot: Chat | null,
  }
  connected: {
    bot: boolean,
    broadcaster: boolean,
  } = { bot: false, broadcaster: false }

  constructor() {
    this.clients = { bot: null, broadcaster: null }
    this.chatClients = { bot: null, broadcaster: null }
    this.connect('bot')
    this.connect('broadcaster')
  }

  async connect(type: 'bot' | 'broadcaster') {
    const [accessToken, refreshToken] = await Promise.all([
      Settings.findOne({ where: { space: 'oauth', name: `${type}AccessToken` } }),
      Settings.findOne({ where: { space: 'oauth', name: `${type}RefreshToken` } })
    ])

    if (!accessToken || !refreshToken) {
      throw (`TMI: accessToken or refreshToken for ${type} not found, client will be not initiliazed.`)
    }

    try {
      await this.disconnect(type)

      const { clientId, scopes } = await OAuth.validate(accessToken.value, type)

      this.clients[type] = Twitch.withCredentials(clientId, accessToken.value, scopes)

      this.chatClients[type] = Chat.forTwitchClient(this.clients[type])

      this.listeners(type)
      await this.chatClients[type].connect()
    } catch (e) {
      console.log(e)
      await OAuth.refresh(refreshToken.value, type)
      this.connect(type)
    }
  }

  async disconnect(type: 'bot' | 'broadcaster') {
    const client = this.chatClients[type] 
    if (client) {
      await client.quit()
      this.chatClients[type] = null
    }
  }

  async listeners(type: 'bot' | 'broadcaster') {
    const client = this.chatClients[type]
    
    client.onConnect(() => {
      console.info(`TMI: ${type.charAt(0).toUpperCase() + type.substring(1)} client connected`)
      this.connected[type] = true
      client.join('sad_satont').catch((e) => {
        if (e.message.includes('Did not receive a reply to join')) return;
        else throw new Error(e)
      })
      if (type === 'bot') import('./loader')
    })
    client.onJoin((channel) => {
      console.info(`TMI: Bot joined ${channel.replace('#', '')}`)
    })

    if (type === 'bot') {
      client.onPrivmsg(async (channel, user, message, raw) => {
        console.info(`>>> ${user}: ${message}`)
        Parser.parse(message, raw)
      })
    }
  }

  async say({ type = 'bot', message }: { type?: 'bot' | 'broadcaster', message: string }) {
    this.chatClients[type]?.say('sad_satont', message)
    console.info(`<<< ${message}`)
  }

  async whispers({ type = 'bot', message, target }: { type?: 'bot' | 'broadcaster', message: string, target: string }) {
    this.chatClients[type]?.whisper(target, message)
    console.info(`<<<W ${message}`)
  }
}
