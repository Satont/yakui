import { readFileSync } from 'fs'
import { resolve} from 'path'
import { get } from 'lodash'
import Settings from '@bot/models/Settings'
import { info } from './logger'

const parameterizedString = (...args) => {
  const params = args.slice(1)
  return args[0].replace(/\$[0-9]+/g, matchedStr => (params[matchedStr.replace('$', '')]))
}

const langsDir = resolve(process.cwd(), 'locales')

export default new class Locales {
  lang: any

  constructor() {
    this.init()
    this.listenDbChanges()
  }

  async init() {
    const [locale]: [Settings] = await Settings.findOrCreate({
      where: { space: 'general', name: 'locale' },
      defaults: { value: 'ru' },
    })
    
    const lang = resolve(langsDir, `${locale.value}.json`)
    this.lang = JSON.parse(readFileSync(lang, 'utf-8'))

    info(`LOCALES: ${this.lang.lang?.name || locale.value} lang loaded`)
  }

  translate(...args: any[]) {
    const path = args[0]
    const result = get(this.lang, path, null)

    if (!result) return get(this.lang, 'errors.langStringNotFound')
    return parameterizedString(result, ...args.slice(1))
  }

  listenDbChanges() {
    Settings.afterCreate((instance) => {
      if (instance.name !== 'locale') return
      
      this.init()
    })
    Settings.afterUpdate((instance) => {
      if (instance.name !== 'locale') return
      
      this.init()
    })
  }
}
