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
      if (typeof operation.filter !== 'undefined' || operation.filter) {
        if (!await this.filter(operation.filter, opts)) continue;
      }
      if (operation.key === 'sendMessage') {
        let message = operation.message
        .replace(new RegExp('[$]username'), opts.username || '')
        .replace(new RegExp('[$]amount'), opts.amount || '')
        .replace(new RegExp('[$]currency'), opts.currency || '')
        .replace(new RegExp('[$]message'), opts.message || '')
        .replace(new RegExp('[$]subTier'), opts.subTier === 'Twitch Prime' ? 'Twitch Prime' : opts.subTier / 1000)
        .replace(new RegExp('[$]subStreak'), opts.subStreak || '')
        .replace(new RegExp('[$]subGiftRecipient'), opts.subGiftRecipient || '')
        .replace(new RegExp('[$]subGifterCount'), opts.subGifterCount || '')
        .replace(new RegExp('[$]emoteOnlyState'), opts.emoteOnlyState ? 'enabled' : 'disabled')
        .replace(new RegExp('[$]hostedViewers'), opts.hostedViewers || '')
        .replace(new RegExp('[$]hostingViewers'), opts.hostingViewers || '')
        .replace(new RegExp('[$]raidViewers'), opts.raidViewers || '')
        .replace(new RegExp('[$]slowModeState'), opts.slowModeState ? 'enabled' : 'disabled')
        .replace(new RegExp('[$]slowModeLength'), opts.slowModeLength || '')
        .replace(new RegExp('[$]subsOnlyChatState'), opts.subsOnlyChatState ? 'enabled' : 'disabled')

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