const socket = require('socket.io-client')
const events = require('../systems/events')
const { io } = require('../libs/panel')


class DonationAlerts {
  constructor () {
    this.connect()
    this.sockets()
    this.repeat = setInterval(() => this.connect(), 1 * 60 * 60 * 1000) // reconnect each hour
  }

  async disconnect () {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
    }
  }

  async connect () {
    this.disconnect()
    this.settings = await global.db('integrations').select('*').where('name', 'donationalerts').first()
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
      })
      this.socket.on('disconnect', () => {
        console.log('DONATIONALERTS.RU: Socket disconnected from service')
        this.disconnect()
        this.socket = null
      })
      this.socket.off('donation').on('donation', async (data) => {
        let { username, amount_main, currency, message, alert_type } = JSON.parse(data)
        if (parseInt(alert_type, 10) !== 1) return
        global.db('users').where({ username: username.toLowerCase().replace(' ', '') }).increment({ tips: Number(amount_main) }).catch(() => {})
        events.fire('tip', { username, amount: amount_main, currency, message })
      })
    }
  }

  async sockets () {
    const self = this
    io.on('connection', function (socket) {
      socket.on('settings.donationalerts', async (data, cb) => {
        const query = await global.db('integrations').select('*').where('name', 'donationalerts').first()
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
