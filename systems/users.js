const { io } = require("../libs/panel")

class Users {
  constructor() {
    this.settings
    this.start()
    this.sockets()
  }
  async start() {
    this.settings = (await global.db.select('*').from('settings').where('system', 'users'))[0].data
  }
  async parse(msg) {
    await global.db('users').insert({ id: msg.tags.userId, username: msg.username }).then(() => {}).catch(() => {})
    await global.db('users').where({ id: msg.tags.userId }).increment({ messages: 1, points: this.settings.pointsPerMessage }).update({username: msg.username})
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