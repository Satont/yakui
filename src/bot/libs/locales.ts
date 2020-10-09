import { readFileSync } from 'fs'
import { resolve } from 'path'
import { get } from 'lodash'
import { Settings } from '@bot/entities/Settings'
import { info } from './logger'
import { orm } from './db'

const parameterizedString = (...args) => {
  const params = args.slice(1)
  return args[0].replace(/\$[0-9]+/g, matchedStr => (params[matchedStr.replace('$', '')]))
}

const langsDir = resolve(process.cwd(), 'locales')

export default new class Locales {
  lang: any

  async init() {
    let locale = await orm.em.getRepository(Settings).findOne({ space: 'general', name: 'locale' })
    if (!locale) {
      locale = orm.em.getRepository(Settings).create({ space: 'general', name: 'locale', value: 'ru' })
      await orm.em.persistAndFlush(locale)
    }

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
}
