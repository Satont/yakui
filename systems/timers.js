const _ = require('lodash')
const { say } = require('./customCommands')
const { io } = require('../libs/panel')
const commons = require('../libs/commons')
const variables = require('../systems/variables')

class Timers {
  constructor () {
    this.init()
    this.sockets()
  }

  async init () {
    clearTimeout(this.timeout)
    const timers = await global.db.select(`*`).from('systems.timers')
    if (!_.isNil(timers)) for (const timer of timers) await global.db('systems.timers').where('name', timer.name).update({ last: 0, triggertimestamp: new Date().getTime() })
    this.check()
  }

  async check () {
    const timers = await global.db.select(`*`).from('systems.timers')
    if (_.isNil(timers)) return setTimeout(() => this.check(), 1000)
    for (const timer of timers) {
      if ((new Date().getTime() - timer.triggertimestamp) > (timer.interval * 1000)) {
        if (!global.tmi.uptime) return
        const response = await variables.prepareMessage(timer.responses[timer.last], { 'display-name': process.env.TWITCH_BOTUSERNAME })
        await say(response)
        await global.db('systems.timers').where('name', timer.name).update({ last: ++timer.last % timer.responses.length, triggertimestamp: new Date().getTime() })
      }
    }
    this.timeout = setTimeout(() => this.check(), 10000)
  }

  async prepareResponse (response) {
    if (response.includes('(api|')) {
      response = await commons.parseMessageApi(response, { 'display-name': process.env.TWITCH_BOTUSERNAME })
    }
    return response
  }

  async sockets () {
    const self = this
    io.on('connection', function (socket) {
      socket.on('list.timers', async (data, cb) => {
        const query = await global.db.select(`*`).from('systems.timers')
        cb(null, query)
      })
      socket.on('create.timer', async (data, cb) => {
        try {
          await global.db('systems.timers').insert(data)
          await self.init()
        } catch (e) {
          global.log.error(e)
        }
      })
      socket.on('delete.timer', async (data, cb) => {
        try {
          await global.db('systems.timers').where('id', data).delete()
          await self.init()
        } catch (e) {
          global.log.error(e)
        }
      })
      socket.on('update.timer', async (data, cb) => {
        try {
          await global.db('systems.timers').where('id', data.id).update(data)
          await self.init()
        } catch (e) {
          global.log.error(e)
        }
      })
    })
  }
}

module.exports = new Timers()
