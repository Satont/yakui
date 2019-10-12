const { readdirSync, readFileSync } = require('fs')
const { join } = require('path')
const { get } = require('lodash')

class Locales {
  avaliableLocales = readdirSync(join(__dirname, '../locales')).map(o => o.replace('.json', ''))

  constructor(locale) {
    if (!this.avaliableLocales.includes(locale)) {
      throw new Error('Cannot find this locale in locales folder')
    } else {
      this.lang = JSON.parse(readFileSync(`${join(__dirname, '../locales')}/${locale}.json`))
    }
  }

  translate(path) {
    const query = get(this.lang, path, 'Not found')
    return query
  }
}

module.exports = new Locales(process.env.BOT_LANG)