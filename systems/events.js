const commons = require('../libs/commons')
const { io } = require('../libs/panel')
const { say } = require('./customCommands')

class Events {
  systemsList = []
  events = []

  constructor() {
    this.load()
    this.sockets()
  }

  async fire (what, opts) {
    let event = this.events.find(o => o.name === what)
    for (let operation of event.operations) {
      if (operation.key === 'sendMessage') {
        let message = operation.message
        message = message.replace('$username', opts.username)
        message = message.replace('$amount', opts.amount)
        message = message.replace('$currency', opts.currency)
        message = message.replace('$message', opts.message ? opts.message : '')
        await say(message)
      }
    }
  }
  async load () {
    this.events = await global.db.select(`*`).from('systems.events')
    for (let system of Object.entries(await commons.autoLoad('./systems/'))) {
      this.systemsList.push(system[1])
    }
  }
  async sockets() {
    const self = this
    io.on('connection', function (socket) {
      socket.on('list.events', async (data, cb) => {
        const query = await global.db.select(`*`).from('systems.events')
        cb(null, query)
      })
      socket.on('events.save', async (data, cb) => {
        self.load()
        await global.db('systems.events').where('name', data.name).update({ operations: JSON.stringify(data.operations) })
      })
    })
  }
}

module.exports = new Events()