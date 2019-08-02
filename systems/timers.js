const _ = require('lodash')
const { say } = require('./customCommands')
const { io } = require("../libs/panel")

class Timers {
  constructor() {
    this.init()
    this.sockets()
  }
  async init() {
    clearTimeout(this.timeout)
    let timers = await global.db.select(`*`).from('systems.timers')
    if (!_.isNil(timers)) for (let timer of timers) await global.db('systems.timers').where('name', timer.name).update({ last: 0, triggertimestamp: new Date().getTime() })
    this.check()
  }
  async check () {
    let timers = await global.db.select(`*`).from('systems.timers')
    if (_.isNil(timers)) return setTimeout(() => this.check(), 1000)
    for (let timer of timers) {
      if ((new Date().getTime() - timer.triggertimestamp) > (timer.interval * 1000)) {
        if (!global.tmi.uptime) return
        await say(timer.responses[timer.last])
        await global.db('systems.timers').where('name', timer.name).update({ last: ++timer.last % timer.responses.length, triggertimestamp: new Date().getTime() })
      }
    }
    this.timeout = setTimeout(() => this.check(), 10000)
  }
  async sockets() {
    let self = this
    io.on('connection', function (socket) {
      socket.on('list.timers', async (data, cb) => {
        let query = await global.db.select(`*`).from('systems.timers')
        cb(null, query)
      })
      socket.on('create.timer', async (data, cb) => {
        try {
          await global.db('systems.timers').insert(data)
          self.init()
        } catch (e) {
          console.log(e)
        }
      })
      socket.on('delete.timer', async (data, cb) => {
        try {
          await global.db('systems.timers').where('name', data).delete()
          self.init()
        } catch (e) {
          console.log(e)
        }
      })
      socket.on('update.timer', async (data, cb) => {
        let name = data.name
        delete data.name
        try {
          await global.db('systems.timers').where('name', name).update(data)
          self.init()
        } catch (e) {
          console.log(e)
        }
      })
    })
  }
}

module.exports = new Timers()