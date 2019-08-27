const { io } = require("../libs/panel")
const _ = require('lodash')
const { say, timeout } = require('./customCommands')

class Moderation {
  urlRegexp = /(www)? ??\.? ?[a-zA-Z0-9]+([a-zA-Z0-9-]+) ??\. ?(aero|bet|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|money|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zr|zw)\b/gi
  commands = [
    { name: 'permit', fnc: this.givePermit }
  ]

  constructor() {
    this.warns = []
    this.settings = null
    this.permits = []
    this.init()
    this.sockets()
  }
  async init() {
    clearInterval(this.clearEach)

    let query = await global.db.select('*').from('systems.moderation')
    this.settings = query
    this.clearEach = setInterval(() => {
      delete this.warns
      this.warns = []
    }, 15 * 60 * 1000)
  }
  announceTimeout (msg, sender) {
    if (this.cooldown) return
    this.cooldown = true
    say(msg.replace('$sender', sender))
    setTimeout(() => this.cooldown = false, 1 * 60 * 1000)
  }
  onMessage (userstate, message) {   
    if (!(this.settings.find(o => o.name === 'main')).enabled) return false
    if (userstate.mod || (userstate.badges && typeof userstate.badges.broadcaster !== 'undefined')) return false
    if (this.blacklist(userstate, message)) return true
    if (this.links(userstate, message)) return true
    if (this.symbols(userstate, message)) return true
    if (this.longMessage(userstate, message)) return true
    if (this.caps(userstate, message)) return true
    if (this.color(userstate, message)) return true
    if (this.emotes(userstate, message)) return true
  }
  links (userstate, message) {
    let links = this.settings.find(o => o.name === 'links')
    if ((userstate.subscriber && !links.settings.moderateSubscribers) || !links.enabled) return false
    else if (links.settings.whitelist.some(o => message.includes(o))) return true
    else if (this.permits.includes(userstate.username) || this.permits.includes(userstate['display-name'])) {
      const index = this.permits.indexOf(userstate.username)
      if (index !== -1) this.permits.splice(index, 1)
      const index2 = this.permits.indexOf(userstate['display-name'])
      if (index !== -1) this.permits.splice(index2, 1)
      return false
    }
    else if (!this.warns.includes(userstate.username) && message.search(this.urlRegexp) >= 0) {
      this.warns.push(userstate.username)
      timeout(userstate.username, 1)
      this.announceTimeout(links.settings.warnuserstate, message.username)
      console.log(`!!! LINK BAN ${userstate.username}, MESSAGE: ${message}`)
      return true
    }
    if (this.warns.includes(userstate.username) && message.search(this.urlRegexp) >= 0) {
      timeout(userstate.username, links.settings.timeout)
      this.announceTimeout(links.settings.timeoutuserstate, message.username)
      console.log(`!!! LINK BAN ${userstate.username}, MESSAGE: ${message}`)
      return true
    }
  }
  symbols (userstate, message) {
    let symbols = this.settings.find(o => o.name === 'symbols')
    if ((userstate.subscriber && !symbols.settings.moderateSubscribers) || !symbols.enabled) return false

    let reg = message.match(/([^\s\u0500-\u052F\u0400-\u04FF\w]+)/g)
    let symbolsLength = 0
    if (message.length < symbols.settings.triggerLength) return false
    for (var item in reg) {
      if (reg.hasOwnProperty(item)) {
        var symbolss = reg[item]
        symbolsLength = symbolsLength + symbolss.length
      }
    }
    if (!this.warns.includes(userstate.username) && Math.ceil(symbolsLength / (message.length / 100)) >= symbols.settings.maxSymbolsPercent) {
      this.warns.push(userstate.username)
      timeout(userstate.username, 1)
      this.announceTimeout(symbols.settings.warnuserstate, message.username)
      console.log(`!!! SYMBOLS BAN ${userstate.username}, LENGTH: ${symbolsLength}`)
      return true
    }
    if (Math.ceil(symbolsLength / (message.length / 100)) >= symbols.settings.maxSymbolsPercent) {
      this.announceTimeout(symbols.settings.timeoutuserstate, message.username)
      timeout(userstate.username, symbols.settings.timeout)
      console.log(`!!! SYMBOLS BAN ${userstate.username}, LENGTH: ${symbolsLength}`)
      return true
    }
  }
  longMessage (userstate, message) {
    let longMessage = this.settings.find(o => o.name === 'longMessage')
    if ((userstate.subscriber && !longMessage.settings.moderateSubscribers) || !longMessage.enabled) return false
    if (message.length < longMessage.settings.triggerLength) return false

    if (!this.warns.includes(userstate.username) && message.length > longMessage.settings.triggerLength) {
      this.warns.push(userstate.username)
      timeout(userstate.username, 1)
      this.announceTimeout(longMessage.settings.warnuserstate, message.username)
      console.log(`!!! LONG MESSAGE ${userstate.username}, LENGTH: ${message.length}`)
      return true
    }
    if (this.warns.includes(userstate.username) && message.length > longMessage.settings.triggerLength) {
      timeout(userstate.username, longMessage.settings.timeout)
      this.announceTimeout(links.settings.timeoutuserstate, message.username)
      console.log(`!!! LONG MESSAGE ${userstate.username}, LENGTH: ${message.length}`)
      return true
    }
  }
  caps (userstate, message) {
    let caps = this.settings.find(o => o.name === 'caps')
    message = message.replace(/[0-9]/g, '')
    if ((userstate.subscriber && !caps.settings.moderateSubscribers) || !caps.enabled) return false
    if (message.length < caps.settings.triggerLength) return false

    let capsLength = 0
    if (message.length < caps.settings.triggerLength) return false
    for (let i = 0; i < message.length; i++) {
      if (message.charAt(i) == message.charAt(i).toUpperCase()) {
        capsLength += 1
      }
    }

    if (!this.warns.includes(userstate.username) && Math.ceil(capsLength / (message.length / 100)) > caps.settings.maxCapsPercent) {
      this.warns.push(userstate.username)
      timeout(userstate.username, 1)
      this.announceTimeout(caps.settings.warnuserstate, message.username)
      console.log(`!!! CAPS BAN ${userstate.username}, LENGTH: ${capsLength}`)
      return true
    }
    if (this.warns.includes(userstate.username) && Math.ceil(capsLength / (message.length / 100)) > caps.settings.maxCapsPercent) {
      this.warns.push(userstate.username)
      timeout(userstate.username, caps.settings.timeout)
      this.announceTimeout(caps.settings.timeoutuserstate, message.username)
      console.log(`!!! CAPS BAN ${userstate.username}, LENGTH: ${capsLength}`)
      return true
    }
  }
  color (userstate, message) {
    let color = this.settings.find(o => o.name === 'color')
    if ((userstate.subscriber && !color.settings.moderateSubscribers) || !color.enabled) return false

    if(userstate["message-type"] !== 'action') {
      return false
    } else if (!this.warns.includes(userstate.username)) {
      this.warns.push(userstate.username)
      timeout(userstate.username, 1)
      this.announceTimeout(color.settings.warnuserstate, message.username)
      console.log(`!!! COLOR BAN ${userstate.username}, MESSAGE: ${message}`)
      return true
    } else if (this.warns.includes(userstate.username)) {
      this.warns.push(userstate.username)
      timeout(userstate.username, color.settings.timeout)
      this.announceTimeout(color.settings.timeoutuserstate, message.username)
      console.log(`!!! COLOR BAN ${userstate.username}, MESSAGE: ${message}`)
      return true
    }
  }
  emotes (userstate, message) {
    let emotes = this.settings.find(o => o.name === 'emotes')
    if ((userstate.subscriber && !emotes.settings.moderateSubscribers) || !emotes.enabled) return false
    let length = userstate.emotes ? _.flattenDeep(_.values(userstate.emotes)).length : 0
    if (!this.warns.includes(userstate.username) && (length > emotes.settings.maxCount)) {
      this.warns.push(userstate.username)
      timeout(userstate.username, emotes.settings.timeout)
      this.announceTimeout(emotes.settings.warnuserstate, message.username)
      console.log(`!!! EMOTES BAN ${userstate.username}, LENGTH: ${length}`)
      return true
    }
    if (this.warns.includes(userstate.username) && (length > emotes.settings.maxCount)) {
      this.warns.push(userstate.username)
      timeout(userstate.username, emotes.settings.timeout)
      this.announceTimeout(emotes.settings.timeoutuserstate, message.username)
      console.log(`!!! EMOTES BAN ${userstate.username}, LENGTH: ${length}`)
      return true
    }
  }
  blacklist (userstate, message) {
    let blacklist = this.settings.find(o => o.name === 'blacklist')
    let returned
    for (let value of blacklist.settings.list) {
      if (value === '') continue
      if (message.includes(value)) {
        timeout(userstate.username, 600)
        console.log(`!!! BLACKLIST BAN ${userstate.username}, WORD: ${value}`)
        returned = true
        break;
      }
    }
    return returned ? true : false
  }
  async givePermit(userstate, message) {
    if (!permissions.hasPerm(userstate.badges, 'moderator') || !message.length) {
      return
    }
    const target = message.replace('@', '').trim()
    
    if (this.permits.includes(target)) return say(`@${userstate.username} ${target} already has a permit`)

    this.permits.push(target)
    setTimeout(() => {
      const index = this.permits.indexOf(target)
      if (index !== -1) this.permits.splice(index, 1)
    }, 5 * 60 * 1000)
  }
  async sockets () {
    let self = this
    io.on('connection', async (socket) => {
      socket.on('settings.moderation', async (data, cb) => {
        let query = await global.db.select('*').from('systems.moderation')
        cb(null, query)
      })
      socket.on('moderation.update', async (data) => {
        let arr = []
        for (let item of Object.entries(data)) {
          let newObject = { ...item.slice(1)[0] }
          if (_.isEmpty(newObject)) continue
          arr.push(newObject)
        }
        for (let item of arr) {
          let name = item.name
          delete item.name
          await global.db('systems.moderation').where('name', name).update(item).catch(console.log)
        }
        await self.init()
      })
    })
  }
}


module.exports = new Moderation()