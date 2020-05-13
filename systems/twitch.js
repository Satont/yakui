const axios = require('axios')
const _ = require('lodash')
const { say } = require('./customCommands')
const permissions = require('../libs/permissions')

class Twitch {
  commands = [
    { name: 'title', fnc: this.titleCommand },
    { name: 'game', fnc: this.gameCommand }
  ]

  async titleCommand (userstate, message) {
    if (!permissions.hasPerm(userstate.badges, 'moderator') || !message.length) {
      return say(`@${userstate.username} ${global.tmi.channelData.status}`)
    }

    try {
      await this.setTitle(message)
      say(`${userstate.username} ===> ${message}`)
      global.tmi.getChannelInfo()
    } catch (e) {
      global.log.error(e)
      say(`${userstate.username} !!! ERROR`)
    }
  }

  async gameCommand (userstate, message) {
    if (!permissions.hasPerm(userstate.badges, 'moderator') || !message.length) {
      return say(`@${userstate.username} ${global.tmi.channelData.game}`)
    }

    try {
      const find = await this.getSuggestedGame(message)
      await this.setGame(find)
      say(`${userstate.username} ===> ${find}`)
      global.tmi.getChannelInfo()
    } catch (e) {
      await this.setGame(message)
      say(`${userstate.username} !!! Game wasn't found on twitch, but setted to ${message}`)
    }
  }

  async setTitle (title) {
    const url = `https://api.twitch.tv/kraken/channels/${global.tmi.channelID}`
    try {
      await axios({
        method: 'PUT',
        url,
        data: { channel: { status: title } },
        headers: {
          'Client-ID': global.tmi.botClientId,
          Authorization: `OAuth ${global.tmi.token}`, 
          'Accept': 'application/vnd.twitchtv.v5+json'
        }
      })
      return true
    } catch (e) {
      throw new Error(e)
    }
  }

  async getSuggestedGame (game) {
    try {
      const request = await axios.get(`https://api.twitch.tv/kraken/search/games?query=${game}&type=suggest`, {
        headers: {
          Accept: 'application/vnd.twitchtv.v5+json',
          'Client-ID': global.tmi.botClientId,
          Authorization: `OAuth ${global.tmi.token}`
        }
      })
      if (_.isNull(request.data.games)) return game
      return request.data.games[0].name
    } catch (e) {
      throw new Error(e)
    }
  }

  async setGame (game) {
    try {
      await axios({
        method: 'PUT',
        url: `https://api.twitch.tv/kraken/channels/${global.tmi.channelID}`,
        data: { channel: { game } },
        headers: {
          'Client-ID': global.tmi.botClientId,
          Authorization: `OAuth ${global.tmi.token}`,
          'Accept': 'application/vnd.twitchtv.v5+json'
        }
      })
      return true
    } catch (e) {
      throw new Error(e)
    }
  }
}

module.exports = new Twitch()
