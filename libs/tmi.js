const Tmi = require('tmi.js')
const customCommands = require('../systems/customCommands')
const fetch = require('node-fetch')
const users = require('../systems/users')
const moderation = require('../systems/moderation')
const permissions = require('./permissions')
const defualtCommands = require('../systems/defaultCommands')
const keywords = require('../systems/keywords')
const { io } = require('./panel')

class TwitchTmi {
  constructor () {
    this.start()
    this.retries = 0
    this.connected = false
    this.uptime = null
    this.sockets()
  }

  async start () {
    clearInterval(this.subsCheckInterval)
    const token = (await global.db('core.tokens').where({ name: 'bot' }).select('value'))[0]
    this.token = token.value
    this.client = new Tmi.client({
      options: {
        debug: true
      },
      connection: {
        reconnect: true,
        secure: true
      },
      identity: {
        username: process.env.TWITCH_BOTUSERNAME,
        password: token ? token.value : ''
      },
      channels: [process.env.TWITCH_CHANNEL]
    })

    await this.connect()
    await this.validateBroadCasterToken()
    await this.getChannelId()
    await this.getUptimeAndViewers()
    await this.getChannelInfo()
    this.subsCheckInterval = setInterval(() => this.getSubscribers(), 1 * 30 * 1000)
    await this.getSubscribers()
  }

  async getToken () {
    console.log('Trying to refresh token')
    try {
      const response = await fetch(`http://auth.satont.ru/refresh?refresh_token=${process.env.TWITCH_TOKEN}`)
      const data = await response.json()
      await global.db('core.tokens').where('name', 'bot').update('value', data.token)
      this.token = data.token
      console.log('Bot token found!')
      return data.token
    } catch (e) {
      console.log(e)
      process.exit(0)
    }
  }

  async validateBroadCasterToken () {
    let token = (await global.db('core.tokens').where({ name: 'broadcaster' }).select('value'))[0]
    token = await token ? token.value : ''
    try {
      let response = await fetch(`https://id.twitch.tv/oauth2/validate`, { headers: { Authorization: `OAuth ${token}` } })
      response = await response.json()
      if (response.status !== '200' && response.status) await this.getBroadcasterToken()
      else if (response.login.toLowerCase() === process.env.TWITCH_CHANNEL.toLowerCase()) {
        console.log('Broadcaster token validated', response.login, response.user_id, response.client_id)
        this.broadcastertoken = token
        return true
      } else {
        console.log('Broadcaster token not validated because wrong token')
        this.broadcastertoken === null
      }
    } catch (e) {
      console.log('Broadcaster token wasnt validated', e)
    }
  }

  async getBroadcasterToken () {
    if (process.env.TWITCH_BROADCASTERTOKEN.length === 0 || process.env.TWITCH_BROADCASTERTOKEN < 10) return
    console.log('Trying to refresh broadcaster token')
    try {
      const response = await fetch(`http://auth.satont.ru/refresh?refresh_token=${process.env.TWITCH_BROADCASTERTOKEN}`)
      const data = await response.json()
      this.broadcastertoken = data.token
      await global.db('core.tokens').where('name', 'broadcaster').update('value', data.token)
      console.log('Broadcaster token found!')
      return data.token
    } catch (e) {
      this.broadcastertoken = null
      console.log('Token wasnt refreshed', e)
    }
  }

  async connect () {
    this.client.connect()
      .then(() => {
        this.connected = true
        this.retries = 0
        this.loadListeners()
        return true
      })
      .catch(e => {
        this.getToken().then(() => this.start())
      })
  }

  async getChannelId () {
    try {
      const response = await fetch(`https://api.twitch.tv/helix/users?login=${process.env.TWITCH_CHANNEL}`, { headers: { 'Client-ID': process.env.TWITCH_CLIENTID } })
      const data = await response.json()
      this.channelID = await data.data[0].id
      console.log(`Channel id is ${this.channelID}`)
    } catch (e) {
      console.log('Cant get channelid', e)
      setTimeout(() => this.getChannelId(), 10000)
    }
  }

  async getUptimeAndViewers () {
    setTimeout(() => this.getUptimeAndViewers(), 30 * 1000)
    try {
      const response = await fetch(`https://api.twitch.tv/kraken/streams/${process.env.TWITCH_CHANNEL.toLowerCase()}`, { headers: { 'Client-ID': process.env.TWITCH_CLIENTID } })
      const stream = await response.json()
      if (stream.stream === null) {
        this.uptime = null
      } else this.uptime = await stream.stream.created_at
      this.streamData = await stream.stream
    } catch (error) {
      throw new Error(error)
    }
  }

  async getChannelInfo () {
    setTimeout(() => this.getChannelInfo(), 30 * 1000)
    try {
      const response = await fetch(`https://api.twitch.tv/kraken/channels/${process.env.TWITCH_CHANNEL.toLowerCase()}`, { headers: { 'Client-ID': process.env.TWITCH_CLIENTID } })
      const data = await response.json()
      this.channelData = data
    } catch (error) {
      this.channelData = null
      throw new Error(error)
    }
  }

  async getSubscribers (opts) {
    if (!this.broadcastertoken) return
    opts = opts || {}
    let url = `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${this.channelID}`
    if (opts.cursor) url += '&after=' + opts.cursor
    if (typeof opts.count === 'undefined') opts.count = -1
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.broadcastertoken}`
        }
      })
      const data = await response.json()
      if (data.status && data.status !== 200) {
        this.subscribers = 0
        return
      }
      if (data.data.length >= 20) {
        // move to next page
        this.getSubscribers({ cursor: data.pagination.cursor, count: data.data.length + opts.count })
      } else {
        this.subscribers = data.data.length + opts.count
        console.log(`Subscribers found! Count: ${this.subscribers}`)
      }
    } catch (e) {
      console.log(`Something went wrong with getSubscribers. Will retry after 1 minute`)
      await this.getBroadcasterToken()
      this.subscribers = 0
    }
  }

  async loadListeners () {
    this.client.on('chat', async (channel, userstate, message, self) => {
      if (self) return
      if (userstate['message-type'] !== 'chat') return
      users.parse(userstate.username, userstate['user-id'])
      if (moderation.moderate(message, userstate)) return
      if (message.toLowerCase().startsWith('!')) {
        let command = message.toLowerCase().substring(1).split(' ')[0]
        if (defualtCommands.commands.has(command)) {
          command = defualtCommands.commands.get(command)
          if (!(await permissions.hasPerm(userstate.badges, command.permission))) return
          return command.run(command, message, userstate)
        } else customCommands.prepareCommand(message, userstate)
      } else keywords.check(message, userstate)
    })
    this.client.on('message', async (channel, userstate, message, self) => {
      if (userstate['message-type'] === 'action') moderation.moderate(message, userstate)
    })
    this.client.on('disconnected', (reason) => {
      console.log(reason)
    })
    this.client.on('subscription', async (channel, username, method, message, userstate) => {
      await global.db('core.subscribers').where('name', 'latestSubscriber').update('value', username)
    })
    this.client.on('resub', async (channel, username, months, message, userstate, methods) => {
      await global.db('core.subscribers').where('name', 'latestReSubscriber').update('value', username)
    })
    this.client.on('cheer', async (channel, userstate, message) => {
      await global.db('users').insert({ id: Number(userstate['user-id']), username: userstate.username }).then(() => {}).catch(() => {})
      await global.db('users').where({ id: Number(userstate['user-id']) }).increment({ bits: Number(userstate.bits) }).update({ username: userstate.username })
    })
  }

  async sockets () {
    const self = this
    io.on('connection', function (socket) {
      socket.on('stream.data', async (what, cb) => {
        const data = {}
        data.uptime = self.streamData ? self.streamData.created_at : null
        data.viewers = self.streamData ? self.streamData.viewers : 0
        data.lang = process.env.BOT_LANG
        data.subscribers = self.subscribers
        data.channel = process.env.TWITCH_CHANNEL.toLowerCase()
        cb(null, { ...data, ...self.channelData })
      })
    })
  }
}

module.exports = new TwitchTmi()
