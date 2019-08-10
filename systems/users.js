const { io } = require("../libs/panel")
const axios = require('axios')
const _ = require('lodash')

class Users {
  constructor() {
    this.settings
    this.start()
    this.sockets()
    this.onlineUsers = []
  }
  async start() {
    this.settings = (await global.db.select('*').from('settings').where('system', 'users'))[0].data
    if (this.settings.enabled) this.checkInterval = setInterval(() => this.checkOnline(), 1 * 60 * 1000)
    else clearInterval(this.checkInterval)
  }
  async parse(username, id) {
    if (!this.settings.enabled) return true

    await global.db('users').insert({ id: Number(id), username: username }).then(() => {}).catch(() => {})
    
    if (global.tmi.uptime && !this.settings.ignorelist.includes(username)) await global.db('users').where({ id: Number(id) }).increment({ messages: 1, points: this.settings.pointsPerMessage }).update({username: username })
  }
  async checkOnline() {
    if (!global.tmi.uptime || !this.settings.enabled) return this.onlineUsers = []
    try {
      let request = await axios.get(`http://tmi.twitch.tv/group/user/${process.env.TWITCH_CHANNEL.toLowerCase()}/chatters`)
      let response = request.data
      let chatters = []
      let now = []
      for (let key of Object.keys(response.chatters)) {
        if (Array.isArray(response.chatters[key])) chatters = chatters.concat(response.chatters[key])
      }
      for (let chunk of _.chunk(chatters, 100)) {
        let request = await this.getUsersByUsername(chunk)
        let newMaped = _.map(request, o => {
          return { username: o.display_name, id: Number(o.id) }
        })
        now = await _.concat(now, newMaped)
      }
      for (let user of await now) {
        if (this.onlineUsers.some(o => o.username === user.username) && !this.settings.ignorelist.includes(user.username)) {
          await global.db('users').insert({ id: user.id, username: user.username }).then(() => {}).catch(() => {})
          await global.db('users').where({ id: user.id }).increment({ watched: 1 * 60 * 1000, points: this.settings.pointsPerTime })
        }
      }
      this.onlineUsers = now
    } catch(e) {
      console.log(e)
    }
  }
  async getIdByUsername(username) {
    try {
      let request = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, { headers: { 'Authorization': `Bearer ${global.tmi.token}` } })
      return request.data.data[0].id
    } catch(e) {
      throw new Error(e.stack)
    }
  }
  async getUsersByUsername(users) {
    try {
      let request = await axios.get(`https://api.twitch.tv/helix/users?login=${users.join('&login=')}`, { headers: { 'Authorization': `Bearer ${global.tmi.token}` } })
      let data = await request.data.data
      return data
    } catch(e) {
      console.log(e)
    }
  }
  async sockets() {
    let self = this
    io.on('connection', function (socket) {
      socket.on('settings.users', async (data, cb) => {
        let query = await global.db('settings').select('*').where('system', 'users')
        cb(null, query[0])
      })
      socket.on('update.settings.users', async (data, cb) => {
        await global.db('settings').where('system', 'users').update({ data })
        self.start()
      })

    })
  }
}

module.exports = new Users()