import { remove } from 'lodash'

import { System, Command, CommandOptions, ParserOptions } from '../typings'
import { Warnings, ISettings } from '../typings/modetation'
import tmi from '../libs/tmi'
import Settings from '../models/Settings'

const urlRegexp = /(www)? ??\.? ?[a-zA-Z0-9]+([a-zA-Z0-9-]+) ??\. ?(aero|bet|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|money|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zr|zw)\b/gi

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

  private checkDoesWarned({ type, username }: { type: keyof Warnings, username: string }) {
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
    const userPermissions = tmi.getUserPermissions(opts.raw.userInfo.badges) 
    if (userPermissions.broadcaster || userPermissions.moderators) return false;
  }

  async parseLinks(opts: ParserOptions) {
    if (opts.message.search(urlRegexp) < 0) return false;

    const username = opts.raw.userInfo.userName.toLowerCase()
    const type = 'links'

    if (this.permits.includes(username)) {
      this.permits.splice(this.permits.indexOf(username), 1)
      remove(this.permits, (item) => item === username)
      return false
    }

    if (this.checkDoesWarned({ type, username })) {
      tmi.timeout({ username, duration: 600, reason: 'links disallowed' })

      this.removeFromWarned({ type, username})
      return true
    } else {
      tmi.timeout({ username, duration: 1, reason: 'links disallowed' })
      this.warnings[type].push(username)
    }
  }

  listenDbUpdates() {
    Settings.afterSave((value => value.space === 'moderation' ? this.init() : undefined))
  }
}
