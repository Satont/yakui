const { io } = require('../libs/panel')
const axios = require('axios')
const _ = require('lodash')

class Users {
  parsers = [
    { name: 'addMessage', fnc: this.addMessage },
    { name: 'pointsMessage', fnc: this.pointsMsg }
  ]
  
  constructor () {
    this.settings = null
    this.start()
    this.sockets()
    this.onlineUsers = []
  }

  async start () {
    this.settings = (await global.db.select('*').from('settings').where('system', 'users'))[0].data
    if (this.settings.enabled) this.checkInterval = setInterval(() => this.checkOnline(), 1 * 60 * 1000)
    else clearInterval(this.checkInterval)
  }

  async addMessage (userstate, message) {
    if (!this.settings.enabled) return true

    const id = Number(userstate['user-id'])
    const username = userstate.username

    await global.db('users').insert({ id, username }).then(() => {}).catch(() => {})

    if (message.startsWith('!')) return 

    if (global.tmi.uptime && !this.settings.ignorelist.includes(username)) {
      await global.db('users').where({ id }).increment({ messages: 1 }).update({ username })
    }
  }

  async pointsMsg (userstate, message) {
    const [messageInterval, pointsPerMessage, userId] = [this.settings.pointsMessageInterval, this.settings.pointsPerMessage, Number(userstate['user-id'])]

    if (messageInterval === 0 || pointsPerMessage === 0 || !global.tmi.uptime) return
    
    const user = await global.db('users').where('id', userId).first()

    if (!user) return

    if (user.lastMessagePoints + messageInterval <= user.messages) {
      await global.db('users').where({ id: userId }).update({ lastMessagePoints: user.messages }).increment({ points: parseInt(pointsPerMessage, 10)})
    }
  }
  async pointsWatched (now) {
    const [pointsPerWatched, pointsInterval] = [this.settings.pointsPerTime, this.settings.pointsWatchedInterval * 60 * 1000]

    if (!global.tmi.uptime) return

    for (const user of now) {
      await global.db('users').insert({ id: user.id, username: user.username }).then(() => {}).catch(() => {})
      const userDb = await global.db('users').where({ id: user.id }).first()
      if (pointsPerWatched !== 0 || pointsInterval !== 0) {
        const shouldUpdate = new Date().getTime() - new Date(Number(userDb.lastWatchedPoints)).getTime() >= pointsInterval
        if (this.onlineUsers.some(o => o.username === user.username) && !this.settings.ignorelist.includes(user.username) && shouldUpdate) {
          await global.db('users').where({ id: user.id }).update({ lastWatchedPoints: Number(new Date().getTime()) }).increment({ watched: 1 * 60 * 1000, points: parseInt(pointsPerWatched, 10)})
        }
      } else {
        await global.db('users').where({ id: user.id }).update({ lastWatchedPoints: Number(new Date().getTime()) }).increment({ watched: 1 * 60 * 1000 })
      }
    }
  }
  async checkOnline () {
    if (!global.tmi.uptime || !this.settings.enabled) {
      this.onlineUsers = []
      return
    }
    try {
      const request = await axios.get(`http://tmi.twitch.tv/group/user/${process.env.TWITCH_CHANNEL.toLowerCase()}/chatters`)
      const response = request.data
      let chatters = []
      let now = []
      for (const key of Object.keys(response.chatters)) {
        if (Array.isArray(response.chatters[key])) chatters = chatters.concat(response.chatters[key])
      }
      for (const chunk of _.chunk(chatters, 100)) {
        const request = await this.getUsersByUsername(chunk)
        const newMaped = _.map(request, o => {
          return { username: o.display_name, id: Number(o.id) }
        })
        now = await _.concat(now, newMaped)
      }
      
      this.onlineUsers = now
      this.pointsWatched(now)
    } catch (e) {
      global.log.error(e)
    }
  }

  async getIdByUsername (username) {
    try {
      const request = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, { headers: { 'Authorization': `Bearer ${global.tmi.token}` } })
      return request.data.data[0].id
    } catch (e) {
      throw new Error(e.stack)
    }
  }

  async getUsersByUsername (users) {
    try {
      const request = await axios.get(`https://api.twitch.tv/helix/users?login=${users.join('&login=')}`, { headers: { 'Authorization': `Bearer ${global.tmi.token}` } })
      const data = await request.data.data
      return data
    } catch (e) {
      global.log.error(e)
    }
  }

  async sockets () {
    const self = this
    io.on('connection', function (socket) {
      socket.on('settings.users', async (data, cb) => {
        const query = await global.db('settings').select('*').where('system', 'users')
        cb(null, query[0])
      })
      socket.on('update.settings.users', async (data, cb) => {
        await global.db('settings').where('system', 'users').update({ data })
        await self.start()
      })
      socket.on('users.get', async (data, cb) => {
        const users = await global.db('users').select('*')
        cb(null, await users)
      })
    })
  }
}

module.exports = new Users()
