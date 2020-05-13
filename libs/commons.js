const fetch = require('node-fetch')
const moment = require('moment')
const humanizeDuration = require('humanize-duration')
const _ = require('lodash')
const axios = require('axios')
const safeEval = require('safe-eval')
const spotify = require('../integrations/spotify')
const { readdirSync } = require('fs')
const { join, normalize } = require('path')

class Commons {
  constructor () {
    setInterval(() => this.logMemoryUsage(), 60 * 1000)
  }

  async autoLoad (directory) {
    const directoryListing = readdirSync(directory);
    const loaded = {};
    for (const file of directoryListing) {
      if (file.startsWith('_') || !file.endsWith('.js')) {
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const imported = require(normalize(join(process.cwd(), directory, file)));
      if (typeof imported.default !== 'undefined') {
        loaded[file.split('.')[0]] = new imported.default(); // remap default to root object
      } else {
        loaded[file.split('.')[0]] = imported;
      }
    }
    return loaded;
  }

  logMemoryUsage () {
    const used = process.memoryUsage()
    const arr = []
    for (const key in used) {
      arr.push(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`)
    }
    console.log(arr.join(' | '))
  }

  parseQueryString (queryString) {
    var params = {}; var queries; var temp; var i; var l
    queries = queryString.split('&')
    for (i = 0, l = queries.length; i < l; i++) {
      temp = queries[i].split('=')
      params[temp[0]] = temp[1]
    }
    return params
  }

  prepareUptime () {
    const uptime = global.tmi.uptime
    if (!uptime) return 'Offline'
    const diff = moment(moment().format()).diff(global.tmi.uptime)
    return humanizeDuration(moment.duration(diff), { language: process.env.BOT_LANG })
  }

  async prepareFollowTime (id) {
    let data
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/users/follows?from_id=${id}&to_id=${global.tmi.channelID}`,
        {
          method: 'GET',
          headers: {
            'Client-ID': global.tmi.botClientId,
            Authorization: `Bearer ${global.tmi.token}`
          }
        }
      )
      data = await response.json()
      data = data.data[0] ? data.data[0].followed_at : null
    } catch (e) {
      global.log.error(e)
    }
    if (_.isNil(data)) {
      return 'not followed'
    }
    const diff = moment(moment().format()).diff(data)
    return humanizeDuration(moment.duration(diff), { units: ['y', 'mo', 'd', 'h', 'm'], round: true, language: process.env.BOT_LANG })
  }

  async getSong (params) {
    if (spotify.settings.enabled) {
      const data = await spotify.nowPlaying()
      if (data) return data
    }
    const url = 'http://api.satont.ru/song?'
    const response = await fetch(url + params)
    const data = response.text()
    return data
  }

  async getLatestSubOrResub (who) {
    const latest = await global.db.select(`*`).from('core.subscribers')
    if (!latest) return ''
    if (who === 'sub') {
      const latestSubscriber = latest.find(o => o.name === 'latestSubscriber')
      return `${await latestSubscriber.value}`
    }
    if (who === 'resub') {
      const latestReSubscriber = latest.find(o => o.name === 'latestReSubscriber')
      return `${await latestReSubscriber.value}`
    }
  }

  async parseMessageApi (message) {
    if (message.trim().length === 0) { return };

    const rMessage = message.match(/\(api\|(http\S+)\)/i)
    if (!_.isNil(rMessage) && !_.isNil(rMessage[1])) {
      message = message.replace(rMessage[0], '').trim() // remove api command from message
      const url = rMessage[1].replace(/&amp;/g, '&')
      const response = await axios.get(url)
      if (response.status !== 200) {
        return 'api status not 200 '
      }

      // search for api datas in message
      const rData = message.match(/\(api\.(?!_response)(\S*?)\)/gi)
      if (_.isNil(rData)) {
        if (_.isObject(response.data)) {
          // Stringify object
          message = message.replace('(api._response)', JSON.stringify(response.data))
        } else { message = message.replace('(api._response)', response.data.toString().replace(/^"(.*)"/, '$1')) };
      } else {
        if (_.isBuffer(response.data)) { response.data = JSON.parse(response.data.toString()) };
        for (const tag of rData) {
          let path = response.data
          const ids = tag.replace('(api.', '').replace(')', '').split('.')
          _.each(ids, function (id) {
            const isArray = id.match(/(\S+)\[(\d+)\]/i)
            if (isArray) {
              path = path[isArray[1]][isArray[2]]
            } else {
              path = path[id]
            }
          })
          message = message.replace(tag, !_.isNil(path) ? path : 'possible you parsing api wrong')
        }
      }
    }
    return message
  }

  async eval (dbResponse, userstate, message) {
    const toEvaluate = dbResponse.replace('(eval ', '').slice(0, -1)
    const toEval = `(async function evaluation () {  ${toEvaluate} })()`
    const context = {
      axios: axios,
      _: _,
      username: userstate.username,
      displayname: userstate['display-name'],
      param: message,
      user: await global.db('users').where('id', userstate['user-id']).first() || { points: 0, messages: 0, watched: 0, bits: 0, tips: 0 },
      say: function (msg) { global.tmi.client.say(process.env.TWITCH_CHANNEL, msg).catch(global.log.error) },
      timeout: function (username, duration) { global.tmi.client.timeout(process.env.TWITCH_CHANNEL, username, duration).catch(global.log.error) }
    }

    const run = await safeEval(toEval, context)
    return run.toString()
  }

  declOfNum (number, titles) {
    titles.length === 2 ? titles[2] = titles[1] : ''
    const cases = [2, 0, 1, 1, 1, 2]
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]]
  }
}

module.exports = new Commons()
