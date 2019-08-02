const axios = require('axios')
const _ = require('lodash')

class Twitch {
  
  async setTitle(title) {
    const url = `https://api.twitch.tv/kraken/channels/${process.env.TWITCH_CHANNEL}`
    try {
        await axios({
        method: 'PUT',
        url,
        data: { channel: { status: title } },
        headers: { 'Authorization': `OAuth ${global.tmi.token}` }
      })
      return true
    } catch (e) {
      throw new Error(e)
    }
  }
  async getSuggestedGame(game) {
    try {
      let request = await axios.get(`https://api.twitch.tv/kraken/search/games?query=${game}&type=suggest`, {
        headers: {
          'Accept': 'application/vnd.twitchtv.v5+json',
          'Authorization': `OAuth ${global.tmi.token}`
        }
      })
      if (_.isNull(request.data.games)) return game = game
      return request.data.games[0].name
    } catch(e) {
      throw new Error(e)
    }
  }
  async setGame(game) {
    try {
      let request = await axios({
        method: 'PUT',
        url: `https://api.twitch.tv/kraken/channels/${process.env.TWITCH_CHANNEL}`,
        data: { channel: { game } },
        headers: { 'Authorization': `OAuth ${global.tmi.token}` }
      })
      return true
    } catch (e) {
      throw new Error(e)
    }
  }
}

module.exports = new Twitch()