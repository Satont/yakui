const socket = require('socket.io-client')
const { say } = require('../systems/commands')
const { io } = require("../libs/panel")

class StreamLabs {
  constructor() {
    this.connect()
    this.sockets()
  }
  async disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
    }
  }
  async connect() {
    this.disconnect()
    this.settings = (await global.db('integrations').select('*').where('name', 'streamlabs'))[0]
    if (!this.settings.enabled || this.settings.settings.token === null) return this.disconnect()
    this.socket = socket.connect(`https://sockets.streamlabs.com?token=${this.settings.settings.token}`)
    if (this.socket !== null) {
      this.socket.on('connect', () => {
        console.log('STREAMLABS: Successfully connected socket to service')
      })
      this.socket.on('reconnect_attempt', () => {
        console.log('STREAMLABS: Trying to reconnect to service')
      });
      this.socket.on('disconnect', () => {
        console.log('STREAMLABS: Socket disconnected from service')
        if (this.socket) {
          this.socket.open()
        }
      })
      this.socket.on('event', data => this.parse(data))
    }
  }
  async parse (data) {
    if (data.type === 'donation') {
      if (!data.isTest) {
        global.db('users').where({ username: data.message[0].from.toLowerCase() }).increment({ tips: data.message[0].amount }).catch(() => {})
      }
      await say(`/me ${data.message[0].from} ${data.message[0].amount}${data.message[0].currency} ${data.message[0].message}`)
    }
  }
  async sockets() {
    let self = this
    io.on('connection', function (socket) {
      socket.on('settings.streamlabs', async (data, cb) => {
        let query = (await global.db('integrations').select('*').where('name', 'streamlabs'))[0]
        cb(null, query)
      })
      socket.on('update.settings.streamlabs', async (data, cb) => {
        await global.db('integrations').where('name', 'streamlabs').update(data)
        self.connect()
      })

    })
  }
}

module.exports = new StreamLabs()