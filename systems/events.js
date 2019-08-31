const commons = require('../libs/commons')
const { io } = require('../libs/panel')
const { say } = require('./customCommands')
const _ = require('lodash')

class Events {
  systemsList = []
  events = []

  constructor() {
    this.load()
    this.sockets()
  }

  async fire (what, opts) {
    let event = this.events.find(o => o.name === what)
    event.operations = _.isPlainObject(event.operations ) ? [] : event.operations
    for (let operation of event.operations) {
      if (operation.key === 'sendMessage') {
        let message = operation.message
        message = message.replace('$username', opts.username || '')
        message = message.replace('$amount', opts.amount || '')
        message = message.replace('$currency', opts.currency || '')
        message = message.replace('$message', opts.message || '')
        message = message.replace('$subTier', opts.subTier === 'Twitch Prime' ? 'Twitch Prime' : opts.subTier / 1000)
        message = message.replace('$subStreak', opts.subStreak || '')
        message = message.replace('$subGiftRecipient', opts.subGiftRecipient || '')
        message = message.replace('$subGifterCount', opts.subGifterCount || '')
        message = message.replace('$emoteOnlyState', opts.emoteOnlyState ? 'enabled' : 'disabled')
        message = message.replace('$hostedViewers', opts.hostedViewers || '')
        message = message.replace('$hostingViewers', opts.hostingViewers || '')
        message = message.replace('$raidViewers', opts.raidViewers || '')
        message = message.replace('$slowModeState', opts.slowModeState ? 'enabled' : 'disabled')
        message = message.replace('$slowModeLength', opts.slowModeLength || '')
        message = message.replace('$subsOnlyChatState', opts.subsOnlyChatState ? 'enabled' : 'disabled')

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
        await global.db('systems.events').where('name', data.name).update({ operations: JSON.stringify(data.operations) })
        await self.load()
      })
    })
  }
}

module.exports = new Events()