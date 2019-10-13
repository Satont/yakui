const { readdirSync, readFileSync } = require('fs')
const { join } = require('path')
const { get } = require('lodash')
const { io } = require('./panel')


class Locales {
  avaliableLocales = readdirSync(join(__dirname, '../locales')).map(o => o.replace('.json', ''))

  constructor(locale) {
    if (!this.avaliableLocales.includes(locale)) {
      throw new Error(`Cannot find ${locale} locale in locales folder`)
    } else {
      this.lang = JSON.parse(readFileSync(`${join(__dirname, '../locales')}/${locale}.json`))
      this.sockets()
    }
  }

  translate(path, variables) {
    let query = get(this.lang, path, 'Not found')
    if (variables) {
      for (let variable of Object.entries(variables)) {
        const regexp = new RegExp(`{${variable[0]}}`, 'ig')
        query = query.replace(regexp, variables[variable[0]])
      }
    }
    return query
  }
  
  async sockets () {
    let self = this
    io.on('connection', async (socket) => {
      socket.emit('langs', self.lang)
    })
  }
}

module.exports = new Locales(process.env.BOT_LANG)