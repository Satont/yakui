const socket = require('socket.io-client')
const { say } = require('../systems/commands')
const { io } = require("../libs/panel")

class DonationAlerts {
  constructor() {
    this.connect()
    this.sockets()
  }
  async disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      clearTimeout(this.repeat)
    }
  }
  async connect() {
    this.disconnect()
    this.repeat = setTimeout(() => this.connect(), 1 * 60 * 60 * 1000) //reconnect each hour
    this.settings = (await global.db('integrations').select('*').where('name', 'donationalerts'))[0]
    if (!this.settings.enabled || this.settings.settings.token === null) return 
    this.socket = socket.connect('wss://socket.donationalerts.ru:443', { 
      reconnection: true, 
      reconnectionDelay: 1000, 
      reconnectionDelayMax: 5000, 
      reconnectionAttempts: Infinity
    })
    if (this.socket !== null) {
      this.socket.on('connect', () => {
        this.socket.emit('add-user', { token: this.settings.settings.token, type: 'minor' })
        console.log('DONATIONALERTS.RU: Successfully connected socket to service')
      })
      this.socket.on('reconnect_attempt', () => {
        console.log('DONATIONALERTS.RU: Trying to reconnect to service')
      });
      this.socket.on('disconnect', () => {
        console.log('DONATIONALERTS.RU: Socket disconnected from service')
        this.disconnect()
        this.socket = null
      })
      this.socket.off('donation').on('donation', async (data) => {
        let { username, amount_main, currency, message, alert_type } = JSON.parse(data)
        if (parseInt(alert_type, 10) !== 1) return 
        global.db('users').where({ username: username.toLowerCase() }).increment({ tips: amount_main }).catch(() => {})
        await say(`/me ${username} ${amount_main}RUB ${message}`)
      })
    }
  }
  async sockets() {
    let self = this
    io.on('connection', function (socket) {
      socket.on('settings.donationalerts', async (data, cb) => {
        let query = (await global.db('integrations').select('*').where('name', 'donationalerts'))[0]
        cb(null, query)
      })
      socket.on('update.settings.donationalerts', async (data, cb) => {
        await global.db('integrations').where('name', 'donationalerts').update(data)
        self.connect()
      })

    })
  }
}

module.exports = new DonationAlerts()