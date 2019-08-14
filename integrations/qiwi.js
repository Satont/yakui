const { say } = require('../systems/customCommands')
const { io } = require('../libs/panel')
const axios = require('axios')

class Qiwi {
  constructor () {
    this.start()
    this.sockets()
  }

  async start () {
    this.settings = (await global.db('integrations').select('*').where('name', 'qiwi'))[0]
    if (this.settings.settings.token) this.repeat = setInterval(() => this.poll(), 3 * 1000)
  }

  async poll () {
    if (!this.settings.settings.token) return
    try {
      const request = await axios(`https://donate.qiwi.com/api/stream/v1/widgets/${this.settings.settings.token}/events?limit=50`)
      const data = await request.data
      if (data.events.length === 0) return
      for (const event of data.events) {
        const username = event.attributes.DONATION_SENDER ? event.attributes.DONATION_SENDER.toLowerCase().replace(' ', '') : 'anonym'
        global.db('users').where({ username }).increment({ tips: event.attributes.DONATION_AMOUNT }).catch(() => {})
        await say(`/me ${username} ${event.attributes.DONATION_AMOUNT}${event.attributes.DONATION_CURRENCY} ${event.attributes.DONATION_MESSAGE ? event.attributes.DONATION_MESSAGE : ''}`)
      }
    } catch (e) {
      throw new Error(e)
    }
  }

  async sockets () {
    const self = this
    io.on('connection', function (socket) {
      socket.on('settings.qiwi', async (data, cb) => {
        const query = (await global.db('integrations').select('*').where('name', 'qiwi'))[0]
        cb(null, query)
      })
      socket.on('update.settings.qiwi', async (data, cb) => {
        await global.db('integrations').where('name', 'qiwi').update(data)
        self.poll()
      })
    })
  }
}

module.exports = new Qiwi()
