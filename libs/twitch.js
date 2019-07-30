const TwitchJs = require('twitch-js').default
const commands = require('../systems/commands')
const _ = require('lodash')
const fetch = require('node-fetch')
const users = require('../systems/users')

class Twitch {
  constructor() {
    this.start()
    this.retries = 0
    this.connected = false
    this.uptime = null
  }
  async start () {
    let token = (await global.db('core.tokens').where({ name: 'bot' }).select('value'))[0]
    this.client = new TwitchJs({ 
      token: token ? token.value : '', 
      username: process.env.TWITCH_BOTUSERNAME, 
      clientId: process.env.TWITCH_CLIENTID, 
      onAuthenticationFailure: () => this.getToken().then(token => token) })
    await this.connect()
    await this.validateBroadCasterToken()
    await this.getChannelId()
    await this.getUptime()
    await this.getSubscribers()
  }
  async getToken () {
    console.log('Trying to refresh token')
    try {
      let response = await fetch(`https://twitchtokengenerator.com/api/refresh/${process.env.TWITCH_TOKEN}`)
      let data = await response.json()
      if (data.success) {
        await global.db('core.tokens').where('name', 'bot').update('value', data.token)
        this.token = data.token
        console.log('Bot token found!')
        return data.token
      } else proccess.exit(0)
    } catch (e) {
      console.log(e)
    }
  }
  async validateBroadCasterToken() {
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
    console.log('Trying to refresh broadcaster token')
    try {
      let response = await fetch(`https://twitchtokengenerator.com/api/refresh/${rocess.env.TWITCH_BROADCASTERTOKEN}`)
      let data = await response.json()
      if (data.success) {
        this.broadcastertoken = data.token
        await global.db('core.tokens').where('name', 'broadcaster').update('value', data.token)
        console.log('Broadcaster token found!')
        return true
      } else {
        this.broadcastertoken === null
      }
    } catch (e) {
      console.log('Token wasnt refreshed', e)
    }
  }
  async connect () {
    if (!this.connected) {
      try {
        await this.client.chat.connect()
        await this.client.chat.join(process.env.TWITCH_CHANNEL)
        this.connected = true
        this.retries = 0
        this.loadListeners()
        return true
      } catch (e) {
        setTimeout(() => this.connect(), 100 * this.retries)
        this.retries++
        throw new Error(e)
      }
    }
  }
  async getChannelId () {
    try {
      const id = await this.client.api.get(`users?login=${process.env.TWITCH_CHANNEL}`)
      this.channelID = await id.users[0].id
      console.log(`Channel id is ${id.users[0].id}`)
    } catch (e) {
      console.log('Cant get channelid', e)
      setTimeout(() => this.getChannelId(), 10000)
    }
  }
  async getUptime() {
    setTimeout(() => this.getUptime(), 5 * 60 * 1000)
    try {
      if (!this.channelID) return
      let stream = await this.client.api.get(`streams/${this.channelID}`)
      if (_.isNil(stream.stream)) {
        this.uptime = null
        return
      }
      this.uptime = await stream.stream.createdAt
      console.log(`Uptime found ${this.uptime}`)
    } catch (error) {
      throw Error(error)
    }
  }
  async getSubscribers(opts) {
    if (!this.broadcastertoken) return
    opts = opts || {}
    let url = `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${this.channelID}`
    if (opts.cursor) url += '&after=' + opts.cursor
    if (typeof opts.count === 'undefined') opts.count = -1
    try {
      let response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.broadcastertoken}`,
        }
      })
      let data = await response.json()
      if (data.status && data.status !== 200) return this.subscribers = 0
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
      setTimeout(() => this.getSubscribers(), 1 * 60 * 1000)
      this.subscribers = 0
    }
    setTimeout(() => this.getSubscribers(), 30 * 60 * 1000)
  }
  async loadListeners () {
    const moderation = require('../systems/moderation')
    let mainModeration = moderation.settings.find(o => o.name === 'main')
    this.client.chat.on('PRIVMSG', async (object) => {
      if (users.settings.enabled) {
        await users.parse(object)
      }
      if (mainModeration.enabled === true) {
        if (await moderation.moderate(object)) return
      }
      if (object.message.toLowerCase().startsWith('!'))  {
        return commands.prepareCommand(object.message.toLowerCase().split(' ')[0], object)
      }
    })
    this.client.chat.on('USERNOTICE/SUBSCRIPTION', async (event) => {
      await global.db('core.subscribers').where('name', 'latestSubscriber').update('value', event.tags.displayName)
    })
    this.client.chat.on('USERNOTICE/RESUBSCRIPTION', async (event) => {
      await global.db('core.subscribers').where('name', 'latestReSubscriber').update('value', event.tags.displayName)
    })
  }
}

module.exports = new Twitch()
