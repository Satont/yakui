import { System, Command, CommandOptions, ParserOptions, UserPermissions } from '../typings'
import { Warnings, ISettings } from '../typings/moderation'
import tmi from '../libs/tmi'
import Settings from '../models/Settings'

const urlRegexp = /(www)? ??\.? ?[a-zA-Z0-9]+([a-zA-Z0-9-]+) ??\. ?(aero|bet|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|money|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zr|zw)\b/gi
const symbolsRegexp = /([^\s\u0500-\u052F\u0400-\u04FF\w]+)/g

export default new class Moderation implements System {
  parsers = [
    { fnc: this.parse }
  ]
  commands: Command[] = [
    { name: 'permit', fnc: this.permit, permission: 'moderators' }
  ]

  permits: string[] = []
  warnings: Warnings = {
    links: [],
    blacklist: [],
    symbols: [],
    longMessage: [],
    caps: [],
    color: [],
    emotes: [],
  }

  settings: ISettings | null = null

  async init() {
    const settings: Settings[] = await Settings.findAll({ where: { space: 'moderation' } })
    if (!settings.length) return;
    this.settings = {} as any

    for (const item of settings) {
      this.settings[item.name] = item.value
    }
  }

  onStreamEnd() {
    for (const [type] of Object.entries(this.warnings)) this[type] = []
  }

  onStreamStart() {
    for (const [type] of Object.entries(this.warnings)) this[type] = []
  }

  private doesWarned({ type, username }: { type: keyof Warnings, username: string }) {
    return this.warnings[type].includes(username.toLowerCase())
  }
  private removeFromWarned({ type, username }: { type: keyof Warnings, username: string }) {
    this.warnings[type].splice(this.warnings[type].indexOf(username.toLowerCase()), 1)
  }

  async permit(opts: CommandOptions) {
    this.permits.push(opts.argument.trim())

    return `$sender permit added for ${opts.argument}`
  }

  async parse(opts: ParserOptions) {
    if (!this.settings || !this.settings.enabled) return false

    const userPermissions = tmi.getUserPermissions(opts.raw.userInfo.badges) 
    if (userPermissions.broadcaster || userPermissions.moderators) return false
    if (await this.links(opts, userPermissions)) return true
    if (await this.symbols(opts, userPermissions)) return true
    if (await this.longMessage(opts, userPermissions)) return true
    if (await this.caps(opts, userPermissions)) return true
    if (await this.color(opts, userPermissions)) return true
    if (await this.emotes(opts, userPermissions)) return true
  }

  async links(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.settings.links

    if (!settings.enabled) return false
    if (!settings.subscribers && permissions.subscribers) return false;
    if (!settings.vips && permissions.vips) return false;

    if (opts.message.search(urlRegexp) < 0) return false;

    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'links'

    if (this.permits.includes(username)) {
      this.removeFromWarned({ type, username })
      return false
    }

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message })

      this.removeFromWarned({ type, username})
      return true
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message })
      this.warnings[type].push(username)
      return true
    }
  }
  async symbols(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.settings.symbols

    if (!settings.enabled) return false
    if (!settings.subscribers && permissions.subscribers) return false;
    if (!settings.vips && permissions.vips) return false;

    if (opts.message.length < settings.trigger.length) return false;

    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'symbols'

    const matched = opts.message.match(symbolsRegexp)
    let symbols = 0

    for (const item in matched) {
      if (matched.hasOwnProperty(item)) {
        const temp = matched[item]
        symbols = symbols + temp.length
      }
    }

    const check = Math.ceil(symbols / opts.message.length / 100) >= settings.trigger.percent

    if (!check) return false;

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message })

      this.removeFromWarned({ type, username})
      return true
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message })
      this.warnings[type].push(username)
      return true
    }
  }

  async longMessage(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.settings.longMessage

    if (!settings.enabled) return false
    if (!settings.subscribers && permissions.subscribers) return false;
    if (!settings.vips && permissions.vips) return false;

    if (opts.message.length < settings.trigger.length) return false;

    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'longMessage'

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message })

      this.removeFromWarned({ type, username})
      return true
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message })
      this.warnings[type].push(username)
      return true
    }
  }

  async caps(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.settings.longMessage

    if (!settings.enabled) return false
    if (!settings.subscribers && permissions.subscribers) return false;
    if (!settings.vips && permissions.vips) return false;

    if (opts.message.length < settings.trigger.length) return false;

    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'caps'
    let message = opts.message

    let capsLength = 0

    for (const emote of opts.raw.parseEmotes()) {
      message = message.slice(emote.position, emote.length)
    }

    for (let i = 0; i < message.length; i++) {
      if (message.charAt(i) == message.charAt(i).toUpperCase()) {
        capsLength += 1
      }
    }

    const check = Math.ceil(capsLength / (message.length / 100)) > settings.trigger.length

    if (!check) return false

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message })

      this.removeFromWarned({ type, username})
      return true
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message })
      this.warnings[type].push(username)
      return true
    }
  }

  async color(opts: ParserOptions, permissions: UserPermissions) {
    return false
  }

  async emotes(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.settings.longMessage

    if (!settings.enabled) return false
    if (!settings.subscribers && permissions.subscribers) return false;
    if (!settings.vips && permissions.vips) return false;

    if (opts.raw.emoteOffsets.size < settings.trigger.length) return false;

    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'emotes'

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message })

      this.removeFromWarned({ type, username})
      return true
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message })
      this.warnings[type].push(username)
      return true
    }
  }

  listenDbUpdates() {
    Settings.afterSave((value => value.space === 'moderation' ? this.init() : undefined))
  }
}
