const { io } = require("../libs/panel")
const _ = require('lodash')
const { say, timeout } = require('./commands')

class Moderation {
  constructor() {
    this.warns = []
    this.settings = null
    this.init()
  }
  async init() {
    let query = await global.db.select('*').from('systems.moderation')
    this.settings = query
    this.sockets()
  }
  async announceTimeout (msg) {
    if (this.cooldown) return
    this.cooldown = true
    await say(msg)
    setTimeout(() => this.cooldown = false, 1 * 60 * 1000)
  }
  async moderate (object) {
    if (object.tags.badges.moderator || typeof object.tags.badges.broadcaster !== 'undefined') return false
    if (await this.blacklist(object)) return true
    if (await this.links(object)) return true
    if (await this.symbols(object)) return true
    if (await this.longMessage(object)) return true
    if (await this.caps(object)) return true
    if (await this.color(object)) return true
    if (await this.emotes(object)) return true
  }
  async links (object) {
    let links = this.settings.find(o => o.name === 'links')
    if ((typeof object.tags.badges.subscriber !== 'undefined' && !links.settings.moderateSubscribers) || !links.enabled) return false

    const urlRegexp = /(www)? ??\.? ?[a-zA-Z0-9]+([a-zA-Z0-9-]+) ??\. ?(aero|bet|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|money|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zr|zw)\b/gi
    if (!this.warns.includes(object.username) && object.message.search(urlRegexp) >= 0) {
      this.warns.push(object.username)
      await timeout(object.username, 1)
      this.announceTimeout(`@${object.username} ссылки запрещены [предупреждение]`)
      console.log(`!!! LINK BAN ${object.username}, MESSAGE: ${object.message}`)
      return true
    }
    if (this.warns.includes(object.username) && object.message.search(urlRegexp) >= 0) {
      await timeout(object.username, links.settings.timeout)
      this.announceTimeout(`@${object.username} ссылки запрещены`)
      console.log(`!!! LINK BAN ${object.username}, MESSAGE: ${object.message}`)
      return true
    }
  }
  async symbols (object) {
    let symbols = this.settings.find(o => o.name === 'symbols')
    if ((typeof object.tags.badges.subscriber !== 'undefined' && !symbols.settings.moderateSubscribers) || !symbols.enabled) return false

    let reg = object.message.match(/([^\s\u0500-\u052F\u0400-\u04FF\w]+)/g)
    let symbolsLength = 0
    if (object.message.length < symbols.settings.triggerLength) return false
    for (var item in reg) {
      if (reg.hasOwnProperty(item)) {
        var symbolss = reg[item]
        symbolsLength = symbolsLength + symbolss.length
      }
    }
    if (!this.warns.includes(object.username) && Math.ceil(symbolsLength / (object.message.length / 100)) >= symbols.settings.maxSymbolsPercent) {
      this.warns.push(object.username)
      await timeout(object.username, 1)
      this.announceTimeout(`@${object.username} слишком много символов [предупреждение]`)
      console.log(`!!! SYMBOLS BAN ${object.username}, LENGTH: ${symbolsLength}`)
      return true
    }
    if (Math.ceil(symbolsLength / (object.message.length / 100)) >= symbols.settings.maxSymbolsPercent) {
      await timeout(object.username, symbols.settings.timeout)
      this.announceTimeout(`@${object.username} слишком много символов`)
      return true
    }
  }
  async longMessage (object) {
    let longMessage = this.settings.find(o => o.name === 'longMessage')
    if ((typeof object.tags.badges.subscriber !== 'undefined' && !longMessage.settings.moderateSubscribers) || !longMessage.enabled) return false
    if (object.message.length < longMessage.settings.triggerLength) return false

    if (!this.warns.includes(object.username) && object.message.length > longMessage.settings.triggerLength) {
      this.warns.push(object.username)
      await timeout(object.username, 1)
      this.announceTimeout(`@${object.username} слишком длинное сообщение [предупреждение]`)
      console.log(`!!! LONG MESSAGE ${object.username}, LENGTH: ${object.message.length}`)
      return true
    }
    if (this.warns.includes(object.username) && object.message.length > longMessage.settings.triggerLength) {
      await timeout(object.username, longMessage.settings.timeout)
      this.announceTimeout(`@${object.username} слишком длинное сообщение [предупреждение]`)
      console.log(`!!! LONG MESSAGE ${object.username}, LENGTH: ${object.message.length}`)
      return true
    }
  }
  async caps (object) {
    let caps = this.settings.find(o => o.name === 'caps')
    object.message = object.message.replace(/[0-9]/g, '')
    if ((typeof object.tags.badges.subscriber !== 'undefined' && !caps.settings.moderateSubscribers) || !caps.enabled) return false
    if (object.tags.emoteOnly == '1') return false
    if (object.message.length < caps.settings.triggerLength) return false

    let capsLength = 0
    if (object.message.length < caps.settings.triggerLength) return false
    for (let i = 0; i < object.message.length; i++) {
      if (object.message.charAt(i) == object.message.charAt(i).toUpperCase()) {
        capsLength += 1
      }
    }

    if (!this.warns.includes(object.username) && Math.ceil(capsLength / (object.message.length / 100)) > caps.settings.maxCapsPercent) {
      this.warns.push(object.username)
      await timeout(object.username, 1)
      this.announceTimeout(`@${object.username} слишком много капса [предупреждение]`)
      console.log(`!!! CAPS BAN ${object.username}, LENGTH: ${capsLength}`)
      return true
    }
    if (this.warns.includes(object.username) && Math.ceil(capsLength / (object.message.length / 100)) > caps.settings.maxCapsPercent) {
      this.warns.push(object.username)
      await timeout(object.username, caps.settings.timeout)
      this.announceTimeout(`@${object.username} слишком много капса`)
      console.log(`!!! CAPS BAN ${object.username}, LENGTH: ${capsLength}`)
      return true
    }
  }
  async color (object) {
    let color = this.settings.find(o => o.name === 'color')
    if ((typeof object.tags.badges.subscriber !== 'undefined' && !color.settings.moderateSubscribers) || !color.enabled) return false

    if(!object.message.startsWith('\u0001ACTION')) {
      return false
    } else if (!this.warns.includes(object.username)) {
      this.warns.push(object.username)
      await timeout(object.username, 1)
      this.announceTimeout(`@${object.username} нельзя цветные сообщения [предупреждение]`)
      console.log(`!!! COLOR BAN ${object.username}, MESSAGE: ${object.message}`)
      return true
    } else if (this.warns.includes(object.username)) {
      this.warns.push(object.username)
      await timeout(object.username, color.settings.timeout)
      this.announceTimeout(`@${object.username} нельзя цветные сообщения`)
      console.log(`!!! COLOR BAN ${object.username}, MESSAGE: ${object.message}`)
      return true
    }
  }
  async emotes (object) {
    let emotes = this.settings.find(o => o.name === 'emotes')
    if ((typeof object.tags.badges.subscriber !== 'undefined' && !emotes.settings.moderateSubscribers) || !emotes.enabled) return false

    if (!this.warns.includes(object.username) && object.tags.emotes.length > emotes.settings.maxCount) {
      this.warns.push(object.username)
      await timeout(object.username, emotes.settings.timeout)
      this.announceTimeout(`@${object.username} слишком много смайликов`)
      console.log(`!!! EMOTES BAN ${object.username}, LENGTH: ${object.tags.emotes.length}`)
      return true
    }
    if (this.warns.includes(object.username) && object.tags.emotes.length > emotes.settings.maxCount) {
      this.warns.push(object.username)
      await timeout(object.username, emotes.settings.timeout)
      this.announceTimeout(`@${object.username} слишком много смайликов`)
      console.log(`!!! EMOTES BAN ${object.username}, LENGTH: ${object.tags.emotes.length}`)
      return true
    }
  }
  async blacklist (object) {
    let blacklist = this.settings.find(o => o.name === 'blacklist')
    for (let value of blacklist.settings.list) {
      if (object.message.includes(value)) {
        await timeout(object.username, 600)
        this.announceTimeout(`@${object.username} использовал запрещённое слово`)
        console.log(`!!! BLACKLIST BAN ${object.username}, WORD: ${value}`)
        break;
      }
    }
  }

  async sockets () {
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
          global.db('systems.moderation').where('name', name).update(item).catch(console.log)
        }
      })
    })
  }
}


module.exports = new Moderation()