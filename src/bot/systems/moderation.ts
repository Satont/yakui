import { System, Command, CommandOptions, ParserOptions, UserPermissions } from 'typings'
import tmi from '@bot/libs/tmi'
import tlds from 'tlds'
import { CommandPermission } from '@bot/entities/Command'
import users from './users'
import { settings } from '../decorators'

/* const urlRegexp = /(www)? ??\.? ?[a-zA-Z0-9]+([a-zA-Z0-9-]+) ??\. ?(aero|bet|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|money|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zr|zw)\b/gi */
const urlRegexp = new RegExp(`(www)? ??\\.? ?[a-zA-Z0-9]+([a-zA-Z0-9-]+) ??\\. ?(${tlds.join('|')})`, 'giu')
const symbolsRegexp = /([^\s\u0500-\u052F\u0400-\u04FF\w]+)/g

class Moderation implements System {
  parsers = [
    { fnc: this.parse },
  ]
  commands: Command[] = [
    {
      name: 'permit',
      fnc: this.permit,
      permission: CommandPermission.MODERATORS,
      visible: false,
      description: 'Give target user 1 permit.',
    },
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

  @settings()
  enabled = false

  @settings()
  links: ILinks = null

  @settings()
  blacklist: IBlackList = null

  @settings()
  symbols: ISymbols = null

  @settings()
  longMessage: ILongMessage = null

  @settings()
  caps: ICaps = null

  @settings()
  emotes: IEmotes = null

  @settings()
  color = null

  onStreamEnd() {
    for (const [type] of Object.entries(this.warnings)) this.warnings[type] = []
  }

  onStreamStart() {
    for (const [type] of Object.entries(this.warnings)) this.warnings[type] = []
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
    if (!this.enabled) return false
    const userPermissions = users.getUserPermissions(opts.raw.userInfo.badges, opts.raw)
    if (userPermissions.broadcaster || userPermissions.moderators) return false
    if (await this.blacklistParser(opts, userPermissions)) return true
    if (await this.linksParser(opts, userPermissions)) return true
    if (await this.symbolsParser(opts, userPermissions)) return true
    if (await this.longMessageParser(opts, userPermissions)) return true
    if (await this.capsParser(opts, userPermissions)) return true
    //if (await this.color(opts, userPermissions)) return true
    if (await this.emotesParser(opts, userPermissions)) return true
  }

  async linksParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.links

    if (!settings?.enabled) return false
    if (!settings?.subscribers && permissions.subscribers) return false
    if (!settings?.vips && permissions.vips) return false

    if (opts.message.search(urlRegexp) < 0) return false
    if (!settings.clips && (/.*(clips.twitch.tv\/)(\w+)/g.test(opts.message) || /.*(www.twitch.tv\/\w+\/clip\/)(\w+)/g.test(opts.message))) return false

    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'links'

    if (this.permits.includes(username)) {
      this.removeFromWarned({ type, username })
      return false
    }

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message })

      this.removeFromWarned({ type, username })
      return true
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message })
      this.warnings[type].push(username)
      return true
    }
  }
  async symbolsParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.symbols

    if (!settings?.enabled) return false
    if (!settings?.subscribers && permissions.subscribers) return false
    if (!settings?.vips && permissions.vips) return false

    if (opts.message.length < settings.trigger.length) return false

    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'symbols'

    const matched = opts.message.match(symbolsRegexp)
    let symbols = 0

    for (const item in matched) {
      if (matched[item]) {
        const temp = matched[item]
        symbols = symbols + temp.length
      }
    }

    const check = Math.ceil(symbols / opts.message.length / 100) >= settings.trigger.percent

    if (!check) return false

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message })

      this.removeFromWarned({ type, username })
      return true
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message })
      this.warnings[type].push(username)
      return true
    }
  }

  async longMessageParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.longMessage

    if (!settings?.enabled) return false
    if (!settings?.subscribers && permissions.subscribers) return false
    if (!settings?.vips && permissions.vips) return false

    if (opts.message.length < settings.trigger.length) return false

    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'longMessage'

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message })

      this.removeFromWarned({ type, username })
      return true
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message })
      this.warnings[type].push(username)
      return true
    }
  }

  async capsParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.caps

    if (!settings?.enabled) return false
    if (!settings?.subscribers && permissions.subscribers) return false
    if (!settings?.vips && permissions.vips) return false


    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'caps'
    let message = opts.message

    let capsLength = 0

    for (const emote of opts.raw.parseEmotes().filter(o => o.type === 'emote')) {
      message = message.replace(emote['name'], '').trim()
    }

    if (message.length < settings.trigger.length) return false

    for (let i = 0; i < message.length; i++) {
      if (message.charAt(i) == message.charAt(i).toUpperCase()) {
        capsLength += 1
      }
    }

    const check = Math.ceil(capsLength / (message.length / 100)) >= settings.trigger.percent

    if (!check) return false

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message })

      this.removeFromWarned({ type, username })
      return true
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message })
      this.warnings[type].push(username)
      return true
    }
  }

  async emotesParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.emotes

    if (!settings?.enabled) return false
    if (!settings?.subscribers && permissions.subscribers) return false
    if (!settings?.vips && permissions.vips) return false

    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'emotes'
    const emotesLength = opts.raw.parseEmotes().filter(o => o.type === 'emote').length

    if (emotesLength < settings.trigger.length) return false

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message })

      this.removeFromWarned({ type, username })
      return true
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message })
      this.warnings[type].push(username)
      return true
    }
  }

  async colorParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.color

    if (!settings?.enabled) return false
    if (!settings?.subscribers && permissions.subscribers) return false
    if (!settings?.vips && permissions.vips) return false

    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'color'

    if ((opts.raw as any).isAction) return false

    if (this.doesWarned({ type, username })) {
      tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message })

      this.removeFromWarned({ type, username })
      return true
    } else {
      tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message })
      this.warnings[type].push(username)
      return true
    }
  }

  async blacklistParser(opts: ParserOptions, permissions: UserPermissions) {
    const settings = this.blacklist

    if (!settings?.enabled) return false
    if (!settings?.subscribers && permissions.subscribers) return false
    if (!settings?.vips && permissions.vips) return false

    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'blacklist'
    let result = false

    for (const value of settings.values) {
      if (value === '') continue
      if (!opts.message.includes(value)) continue

      if (this.doesWarned({ type, username })) {
        tmi.timeout({ username, duration: settings.timeout.time, reason: settings.timeout.message })
        this.removeFromWarned({ type, username })
      } else {
        tmi.timeout({ username, duration: settings.warning.time, reason: settings.warning.message })
        this.warnings[type].push(username)
      }

      result = true
      break
    }

    return result
  }
}

export default new Moderation()

export interface Warnings {
  [x: string]: string[],
}

export interface ITimeoutWarning {
  time: number,
  message: string
}

export interface IDefaultSettings {
  enabled: boolean,
  subscribers: boolean,
  vips: boolean,
  timeout: ITimeoutWarning,
  warning: ITimeoutWarning,
}

export interface ILinks extends IDefaultSettings {
  clips: boolean,
}

export interface ISymbols extends IDefaultSettings {
  trigger: {
    length: number,
    percent: number,
  }
}

export interface ILongMessage extends IDefaultSettings {
  trigger: {
    length: number,
  }
}

export interface ICaps extends IDefaultSettings {
  trigger: {
    length: number,
    percent: number,
  }
}

export interface IEmotes extends IDefaultSettings {
  trigger: {
    length: number,
  }
}

export interface IBlackList extends IDefaultSettings {
  values: string[]
}
