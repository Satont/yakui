const axios = require('axios')
const { say } = require('./commands')
const _ = require('lodash')

class Twitch {
  constructor() {
    this.commands = [
      { name: "!title", fnc: this.title },
      { name: "!game", fnc: this.game },
    ]
  }

  async title(message, userstate) {
    if (!userstate.mod && (userstate.badges && typeof userstate.badges.broadcaster === 'undefined')) return
    let args = message.split(' ')
    args.shift()
    if (!args.length) return
    let title = args.join(' ')
    const url = `https://api.twitch.tv/kraken/channels/${process.env.TWITCH_CHANNEL}`
    try {
        await axios({
        method: 'PUT',
        url,
        data: { channel: { status: title } },
        headers: { 'Authorization': `OAuth ${global.tmi.token}` }
      })
      say(`${userstate.username} ===> ${title}`)
    } catch (e) {
      say(`${userstate.username} !!! ERROR`)
      console.log(e)
    }
  }
  async game(message, userstate) {
    if (!userstate.mod && (userstate.badges && typeof userstate.badges.broadcaster === 'undefined')) return
    let args = message.split(' ')
    args.shift()
    if (!args.length) return
    let game = args.join(' ')
    try {
      let request = await axios.get(`https://api.twitch.tv/kraken/search/games?query=${game}&type=suggest`, {
        headers: {
          'Accept': 'application/vnd.twitchtv.v5+json',
          'Authorization': `OAuth ${global.tmi.token}`
        }
      })
      if (_.isNull(request.data.games)) return game = game
      game = request.data.games[0].name
    } catch(e) {
      console.log(e)
    }
    
    try {
      let request = await axios({
        method: 'PUT',
        url: `https://api.twitch.tv/kraken/channels/${process.env.TWITCH_CHANNEL}`,
        data: { channel: { game } },
        headers: { 'Authorization': `OAuth ${global.tmi.token}` }
      })
      console.log(request.data)
      say(`${userstate.username} ===> ${game}`)
    } catch (e) {
      say(`${userstate.username} !!! ERROR`)
      console.log(e)
    }
  }
}

module.exports = new Twitch()