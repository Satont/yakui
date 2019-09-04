const { io } = require('../libs/panel')
const { say } = require('./customCommands')
const _ = require('lodash')
const safeEval = require('safe-eval')

class Events {
  events = []

  constructor() {
    this.load()
    this.sockets()
  }

  async fire (what, opts) {
    let event = this.events.find(o => o.name === what)
    event.operations = _.isPlainObject(event.operations ) ? [] : event.operations
    for (let operation of event.operations) {
      if (operation.filter) {
        if (!await this.filter(operation.filter, opts)) break;
      }
      if (operation.key === 'sendMessage') {
        let message = operation.message
        .replace('$username', opts.username || '')
        .replace('$amount', opts.amount || '')
        .replace('$currency', opts.currency || '')
        .replace('$message', opts.message || '')
        .replace('$subTier', opts.subTier === 'Twitch Prime' ? 'Twitch Prime' : opts.subTier / 1000)
        .replace('$subStreak', opts.subStreak || '')
        .replace('$subGiftRecipient', opts.subGiftRecipient || '')
        .replace('$subGifterCount', opts.subGifterCount || '')
        .replace('$emoteOnlyState', opts.emoteOnlyState ? 'enabled' : 'disabled')
        .replace('$hostedViewers', opts.hostedViewers || '')
        .replace('$hostingViewers', opts.hostingViewers || '')
        .replace('$raidViewers', opts.raidViewers || '')
        .replace('$slowModeState', opts.slowModeState ? 'enabled' : 'disabled')
        .replace('$slowModeLength', opts.slowModeLength || '')
        .replace('$subsOnlyChatState', opts.subsOnlyChatState ? 'enabled' : 'disabled')

        await say(message)
      }
    }
  }
  async filter (filter, opts) {
    const toEval = `(async function evaluation () {  return ${filter} })()`
    const context = {
      $username: _.get(opts, 'username', null),
      $amount: _.get(opts, 'amount', null),
      $message: _.get(opts, 'message', null),
      $subTier: _.get(opts, 'subTier', null),
      $subStreak: _.get(opts, 'subStreak', null),
      $subGiftRecipient: _.get(opts, 'subGiftRecipient', null),
      $subGifterCount: _.get(opts, 'subGifterCount', null),
      $emoteOnlyState: _.get(opts, 'emoteOnlyState', null),
      $hostedViewers: _.get(opts, 'hostedViewers', null),
      $hostingViewers: _.get(opts, 'hostingViewers', null),
      $raidViewers: _.get(opts, 'raidViewers', null),
      $slowModeState: _.get(opts, 'slowModeState', null),
      $slowModeLength: _.get(opts, 'slowModeLength', null),
      $subsOnlyChatState: _.get(opts, 'subsOnlyChatState', null),
    }

    const run = await safeEval(toEval, context)
    return run
  }
  async load () {
    this.events = await global.db.select(`*`).from('systems.events')
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