const Tmi = require('tmi.js')
const fetch = require('node-fetch')
const moderation = require('../systems/moderation')
const { io } = require('./panel')
const parser = require('./parser')
const events = require('../systems/events')

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
    const token = await global.db('core.tokens').where({ name: 'bot' }).select('value').first()
    this.token = token.value
    this.client = new Tmi.client({
      options: {
        debug: false
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
    setInterval(() => this.getToken(), 1 * 60 * 60 * 1000)
    setInterval(() => this.getBroadcasterToken(), 1 * 60 * 60 * 1000)
    this.subsCheckInterval = setInterval(() => this.getSubscribers(), 1 * 30 * 1000)
    await this.getSubscribers()
  }

  async getToken () {
    global.log.info('Trying to refresh token')
    try {
      const response = await fetch(`http://auth.satont.ru/refresh?refresh_token=${process.env.TWITCH_TOKEN}`)
      const data = await response.json()
      await global.db('core.tokens').where('name', 'bot').update('value', data.token)
      this.token = data.token
      global.log.info('Bot token found!')
      return data.token
    } catch (e) {
      global.log.error(e)
      process.exit(0)
    }
  }

  async validateBroadCasterToken () {
    let token = await global.db('core.tokens').where({ name: 'broadcaster' }).select('value').first()
    token = await token ? token.value : ''
    try {
      let response = await fetch(`https://id.twitch.tv/oauth2/validate`, { headers: { Authorization: `OAuth ${token}` } })
      response = await response.json()
      if (response.status !== '200' && response.status) await this.getBroadcasterToken()
      else if (response.login.toLowerCase() === process.env.TWITCH_CHANNEL.toLowerCase()) {
        global.log.info('Broadcaster token validated', response.login, response.user_id, response.client_id)
        this.broadcastertoken = token
        return true
      } else {
        global.log.info('Broadcaster token not validated because wrong token')
        this.broadcastertoken === null
      }
    } catch (e) {
      global.log.error('Broadcaster token wasnt validated', e)
    }
  }

  async getBroadcasterToken () {
    if (process.env.TWITCH_BROADCASTERTOKEN.length === 0 || process.env.TWITCH_BROADCASTERTOKEN < 10) return
    global.log.info('Trying to refresh broadcaster token')
    try {
      const response = await fetch(`http://auth.satont.ru/refresh?refresh_token=${process.env.TWITCH_BROADCASTERTOKEN}`)
      const data = await response.json()
      this.broadcastertoken = data.token
      await global.db('core.tokens').where('name', 'broadcaster').update('value', data.token)
      global.log.info('Broadcaster token found!')
      return data.token
    } catch (e) {
      this.broadcastertoken = null
      global.log.error('Token wasnt refreshed', e)
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
        if (e === 'Login authentication failed') return this.getToken().then(() => this.start())
        else {
          setTimeout(() => this.connect(), this.retries * 1000)
          this.retries++
        }
      })
  }

  async getChannelId () {
    try {
      const response = await fetch(`https://api.twitch.tv/helix/users?login=${process.env.TWITCH_CHANNEL}`, { headers: { 'Client-ID': process.env.TWITCH_CLIENTID } })
      const data = await response.json()
      this.channelID = await data.data[0].id
      global.log.info(`Channel id is ${this.channelID}`)
    } catch (e) {
      global.log.error(e)
      setTimeout(() => this.getChannelId(), 10000)
    }
  }

  async getUptimeAndViewers () {
    setTimeout(() => this.getUptimeAndViewers(), 30 * 1000)
    try {
      const response = await fetch(`https://api.twitch.tv/kraken/streams/${this.channelID}`, { 
        headers: { 
          'Client-ID': process.env.TWITCH_CLIENTID,
          'Accept': 'application/vnd.twitchtv.v5+json'
        }
      })
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
      const response = await fetch(`https://api.twitch.tv/kraken/channels/${this.channelID}`, { 
        headers: { 
          'Client-ID': process.env.TWITCH_CLIENTID,
          'Accept': 'application/vnd.twitchtv.v5+json'
        }
      })
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
      global.log.error(`Something went wrong with getSubscribers. Will retry after 1 minute`)
      await this.getBroadcasterToken()
      this.subscribers = 0
    }
  }

  async loadListeners () {
    this.client.on('message', async (channel, userstate, message, self) => {
      if (self) return global.log.chatOut(`${userstate.username}: ${message}`)
      if (userstate['message-type'] === 'whisper') return // we do not want listen whispers
      global.log.chatIn(`${userstate.username}: ${message} | UserId: [${userstate['user-id']}]`)
      moderation.onMessage(userstate, message)
      parser(userstate, message)
      events.fire('message', { username: userstate.username })
    })
    this.client.on('disconnected', (reason) => {
      global.log.error(reason)
      this.connect()
    })
    this.client.on('subscription', async (channel, username, methods, message, userstate) => {
      global.log.sub(`username: ${username}, userId: ${userstate['user-id']}, message: ${message}, method: ${methods.plan}`)
      await global.db('core.subscribers').where('name', 'latestSubscriber').update('value', username)
      events.fire('sub', { username, subTier: methods.plan, message })
    })
    this.client.on('resub', async (channel, username, months, message, userstate, methods) => {
      global.log.resub(`username: ${username}, userId: ${userstate['user-id']}, message: ${message}, method: ${methods.plan}, months: ${months}, subStreak: ${userstate['msg-param-cumulative-months']}`)
      await global.db('core.subscribers').where('name', 'latestReSubscriber').update('value', username)
      events.fire('resub', { username, subTier: methods.plan, message, subStreak: userstate['msg-param-cumulative-months'] })
    })
    this.client.on('cheer', async (channel, userstate, message) => {
      global.log.bits(`username: ${userstate.username}, userId: ${userstate['user-id']}, message: ${message}, bits: ${userstate.bits}`)
      events.fire('tip', { username: userstate.username, amount: userstate.bits, message })
      await global.db('users').insert({ id: Number(userstate['user-id']), username: userstate.username }).then(() => {}).catch(() => {})
      await global.db('users').where({ id: Number(userstate['user-id']) }).increment({ bits: Number(userstate.bits) }).update({ username: userstate.username })
    })
    this.client.on('anongiftpaidupgrade', async (channel, username, userstate) => {
      await global.db('core.subscribers').where('name', 'latestReSubscriber').update('value', username)
    })
    this.client.on('giftpaidupgrade', async (channel, username, sender, userstate) => {
      await global.db('core.subscribers').where('name', 'latestReSubscriber').update('value', username)
    })
    this.client.on('subgift', async (channel, username, streakMonths, recipient, methods, userstate) => {
      global.log.subgift(`username: ${username}, recipient: ${recipient}, method: ${methods.plan}`)
      events.fire('subGift', { username, subTier: methods.plan, subStreak: streakMonths, subGiftRecipient: recipient, subGifterCount: userstate['msg-param-sender-count'] })
      await global.db('core.subscribers').where('name', 'latestReSubscriber').update('value', userstate['msg-param-recipient-user-name'])
    })
    this.client.on('clearchat', async (channel) => {
      global.log.info('chat was cleared')
      events.fire('chatClear', {})
    })
    this.client.on('join', async (channel, username, self) => {
      if (global.systems.users.settings.ignorelist.includes(username)) return
      events.fire('userJoin', { username })
    })
    this.client.on('part', async (channel, username, self) => {
      if (global.systems.users.settings.ignorelist.includes(username)) return
      events.fire('userPart', { username })
    })
    this.client.on('emoteonly', async (channel, enabled) => {
      global.log.info(`emote only ${enabled}`)
      events.fire('emoteOnly', { emoteOnlyState: enabled })
    })
    this.client.on('hosted', async (channel, username, viewers, autohost) => {
      global.log.hosted(`host from ${username}, viewers: ${viewers}, autohost: ${autohost}`)
      events.fire('hosted', { username, hostedViewers: viewers })
    })
    this.client.on('hosting', (channel, target, viewers) => {
      global.log.info(`starting host ${target} with ${viewers} viewers`)
      events.fire('hosting', { username: target, hostingViewers: viewers })
    })
    this.client.on('raided', (channel, username, viewers) => {
      global.log.raided(`raid from ${username}, viewers: ${viewers}`)
      events.fire('raided', { username, raidViewers: viewers })
    })
    this.client.on('slowmode', (channel, enabled, length) => {
      global.log.info(`slowmode now ${enabled} (${length})`)
      events.fire('slowMode', { slowModeState: enabled, slowModeLength: length })
    })
    this.client.on('subscribers', (channel, enabled) => {
      global.log.info(`subscribers only chat now ${enabled}`)
      events.fire('subsOnlyChat', { subsOnlyChatState: enabled })
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
