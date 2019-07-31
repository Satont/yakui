const { io } = require("../libs/panel")
const axios = require('axios')

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
    await global.db('users').insert({ id: Number(id), username: username }).then(() => {}).catch(() => {})
    await global.db('users').where({ id: Number(id) }).increment({ messages: 1, points: this.settings.pointsPerMessage }).update({username: username })
  }
  async checkOnline() {
    if (!global.twitch.uptime || !this.settings.enabled) return
    try {
      let request = await axios.get(`http://tmi.twitch.tv/group/user/${process.env.TWITCH_CHANNEL.toLowerCase()}/chatters`)
      let response = request.data
      let now = []
      for (let key of Object.keys(response.chatters)) {
        if (Array.isArray(response.chatters[key])) now = now.concat(response.chatters[key])
      }
      for (let user of now) {
        if (this.onlineUsers.includes(user)) {
          let userId = await this.getIdByUsername(user)
          await global.db('users').insert({ id: Number(userId), username: user }).then(() => {}).catch(() => {})
          await global.db('users').where({ id: Number(userId) }).increment({ watched: 1 * 60 * 1000 })
        }
      }
      this.onlineUsers = now
    } catch(e) {
      console.log(e)
    }
  }
  async getIdByUsername(username) {
    try {
      let request = await axios.get(`https://api.twitch.tv/helix/users?login=${username}`, { headers: { 'Client-ID': process.env.TWITCH_CLIENTID } })
      return request.data.data[0].id
    } catch(e) {
      throw new Error(e.stack)
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