const socket = require('socket.io-client')

class DonationAlerts {
  constructor() {
    this.connect()
  }
  async connect() {
    let repeat = setTimeout(() => this.connect(), 1 * 60 * 60 * 1000) //reconnect each hour
    this.settings = (await global.db('integrations').select('*').where('name', 'donationalerts'))[0]
    if (!this.settings) return 
  }
}

module.exports = new DonationAlerts()