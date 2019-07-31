const fetch = require('node-fetch')
const moment = require('moment')
const humanizeDuration = require('humanize-duration')
const _ = require('lodash')
const axios = require('axios')
const safeEval = require('safe-eval')


class Commons {
  constructor() {
    setInterval(() => this.logMemoryUsage(), 60 * 1000)
  }
  logMemoryUsage() {
    const used = process.memoryUsage()
    let arr = []
    for (let key in used) {
      arr.push(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`)
    }
    console.log(arr.join(' | '))
  }
  parseQueryString (queryString) {
    var params = {}, queries, temp, i, l;
    queries = queryString.split("&");
    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=')
        params[temp[0]] = temp[1]
    }
    return params
  }
  prepareUptime () {
    let uptime = global.twitch.uptime
    if (!uptime) return 'Offline'
    let diff = moment(moment().format()).diff(global.twitch.uptime)
    return humanizeDuration(moment.duration(diff), { language: process.env.LANGUAGE })
  }
  async prepareFollowTime (id) {
    let data
    try {
      let response = await fetch(
        `https://api.twitch.tv/helix/users/follows?from_id=${id}&to_id=${global.twitch.channelID}`,
        {
          method: 'GET',
          headers: {
            'Client-ID': process.env.TWITCH_CLIENTID,
            'Authorization': `Bearer ${global.twitch.broadcaster_token}`
          }
        }
      )
      data = await response.json()
      data = await data.data[0] ? data.data[0].followed_at : null
    } catch (e) {
      console.log(e)
    }
    if (_.isNil(await data)) {
      return 'not followed'
    }
    let diff = moment(moment().format()).diff(await data)
    return humanizeDuration(moment.duration(diff), { units: ['y', 'mo', 'd', 'h', 'm'], round: true, language: process.env.LANGUAGE })
  }
  async getSong(params) {
    let url = 'http://api.satont.ru/song?'
    let response = await fetch(url + params)
    let data = response.text()
    return data
  }
  async getLatestSubOrResub (who) {

    let latest = await global.db.select(`*`).from('core.subscribers')
    if (!latest) return ''
    if (who === 'sub') {
      let latestSubscriber = latest.find(o => o.name === 'latestSubscriber')
      return `${await latestSubscriber.value}`
    }
    if (who === 'resub') {
      let latestReSubscriber = latest.find(o => o.name === 'latestReSubscriber')
      return `${await latestReSubscriber.value}`
    }
  }
  async parseMessageApi (message) {
    if (message.trim().length === 0) {return};
  
    let rMessage = message.match(/\(api\|(http\S+)\)/i);
    if (!_.isNil(rMessage) && !_.isNil(rMessage[1])) {
      message = message.replace(rMessage[0], '').trim(); // remove api command from message
      let url = rMessage[1].replace(/&amp;/g, '&');
      let response = await axios.get(url);
      if (response.status !== 200) {
        return 'api status not 200 '
      }
  
      // search for api datas in message
      let rData = message.match(/\(api\.(?!_response)(\S*?)\)/gi);
      if (_.isNil(rData)) {
        if (_.isObject(response.data)) {
          // Stringify object
          message = message.replace('(api._response)', JSON.stringify(response.data));
        } else {message = message.replace('(api._response)', response.data.toString().replace(/^"(.*)"/, '$1'))};
      } else {
        if (_.isBuffer(response.data)) {response.data = JSON.parse(response.data.toString())};
        for (let tag of rData) {
          let path = response.data;
          let ids = tag.replace('(api.', '').replace(')', '').split('.');
          _.each(ids, function (id) {
            let isArray = id.match(/(\S+)\[(\d+)\]/i);
            if (isArray) {
              path = path[isArray[1]][isArray[2]];
            } else {
              path = path[id];
            }
          });
          message = message.replace(tag, !_.isNil(path) ? path : 'possible you parsing api wrong')
        }
      }
    }
    return message
  }
  async eval(dbResponse, username, displayname) {
    let toEvaluate = dbResponse.replace('(eval ', '').slice(0, -1);
    
    let toEval = `(async function evaluation () {  ${toEvaluate} })()`;
    let context = {
      axios: axios,
      _: _,
      username: username,
      displayname: displayname,
      say: function (msg) { global.twitch.client.chat.say(process.env.TWITCH_CHANNEL, msg).catch(console.log) },
      timeout: function (username, duration) { global.twitch.client.chat.timeout(process.env.TWITCH_CHANNEL, username, duration).catch(console.log) }
    };

    let run = await safeEval(toEval, context)
    return run.toString()
  }
  getUserPermission (badges) {
    if (!badges) return 'viewer'
    else if (typeof badges.subscriber !== 'undefined') return 'broadcaster'
    else if (typeof badges.moderator !== 'undefined') return 'moderator'
    else if (typeof badges.subscriber !== 'undefined') return 'subscriber'
    else if (typeof badges.vip !== 'undefined') return 'vip'
    else return 'viewer'
  }
}

module.exports = new Commons()
