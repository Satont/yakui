const { io } = require("../libs/panel")
const axios = require('axios')

class Users {
  constructor() {
    this.settings
    this.start()
    this.sockets()
    this.onlineUsers = []
    this.checkInterval = setInterval(() => this.checkOnline(), 5 * 1000)
  }
  async start() {
    this.settings = (await global.db.select('*').from('settings').where('system', 'users'))[0].data
  }
  async parse(msg) {
    await global.db('users').insert({ id: Number(msg.tags.userId), username: msg.username }).then(() => {}).catch(() => {})
    await global.db('users').where({ id: Number(msg.tags.userId) }).increment({ messages: 1, points: this.settings.pointsPerMessage }).update({username: msg.username})
  }
  async checkOnline() {
    //if (!global.twitch.uptime || !this.settings.enabled) return
    let request = await axios.get(`http://tmi.twitch.tv/group/user/${process.env.TWITCH_CHANNEL.toLowerCase()}/chatters`)
    let response = request.data
    let now = []
    for (let key of Object.keys(response.chatters)) {
      if (Array.isArray(response.chatters[key])) now = now.concat(response.chatters[key])
    }
    for (let user of now) {
      if (this.onlineUsers.includes(user)) {
        console.log(`${user} онлайн, тут добавить ему минуту времени`)
      }
    }
    this.onlineUsers = now
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