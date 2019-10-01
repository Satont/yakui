const axios = require('axios')
const { io } = require('../libs/panel')

class Notable {
  constructor () {
    this.init()
    this.sockets()
  }

  async init () {
    const query = await global.db.select('*').from('settings').where('system', 'notable').first()
    this.settings = query.data
    if (this.settings.token && this.settings.token !== '') {
      axios.put(`http://aibt.ga/api/channel`, {
        channel: process.env.TWITCH_CHANNEL.toLocaleLowerCase(),
        token: this.settings.token
      }).catch(() => {})
    }
  }

  async np () {
    if (!this.settings.enabled || !this.settings.token) return 'Notable system disabled or wrong token'
    try {
      let response = await axios(`http://aibt.ga/api/notableplayers?channel=${process.env.TWITCH_CHANNEL.toLocaleLowerCase()}&token=${this.settings.token}`)
      response = await response.data
      let message = await this.settings.notable
      message = message.replace('$gamemode', response.gamemode)
      message = message.replace('$mmr', response.mmr)
      message = message.replace('$list', response.players.length ? response.players.map(o => o.nickname + '(' + o.hero + ')').join(', ')
        : this.settings.nonotable)
      return message
    } catch (e) {
      return e.response.data.description.replace("Game wasn't found", this.settings.gamenotfound)
    }
  }

  async lastgame () {
    if (!this.settings.enabled || !this.settings.token) return 'Notable system disabled or wrong token'
    try {
      let response = await axios(`http://aibt.ga/api/lastgame?channel=${process.env.TWITCH_CHANNEL.toLocaleLowerCase()}&token=${this.settings.token}`)
      response = await response.data
      let message = await this.settings.lastgametext
      message = message.replace('$list', response.players.map(o => `${o.now} ${this.settings.wason} ${o.was}`).join(', '))
      return message
    } catch (e) {
      let message = e.response.data.description
      message = message.replace('Not playing with anyone from last game', this.settings.noplayersfromlastgame)
      message = message.replace("Game wasn't found", this.settings.gamenotfound)
      return message
    }
  }

  async gammedals () {
    try {
      let response = await axios(`http://aibt.ga/api/gamemedals?channel=${process.env.TWITCH_CHANNEL.toLocaleLowerCase()}&token=${this.settings.token}`)
      response = await response.data
      let message = await this.settings.medalstext
      message = message.replace('$list', response.medals.map(o => `${o.hero}: ${o.medal}`).join(', '))
      return message
    } catch (e) {
      let message = e.response.data.description
      message = message.replace("Game wasn't found", this.settings.gamenotfound)
      return message
    }
  }

  async score () {
    try {
      let response = await axios(`http://aibt.ga/api/score?channel=${process.env.TWITCH_CHANNEL.toLocaleLowerCase()}&token=${this.settings.token}`)
      response = await response.data
      let message = await this.settings.scoretext
      message = message.replace('$wins', response.wins)
      message = message.replace('$lose', response.lose)
      return message
    } catch (e) {
      let message = e.response.data.description
      message = message.replace('Stream not live', this.settings.streamoffline)
      return message
    }
  }

  async addacc (param) {
    console.log(this.settings.token)
    try {
      await axios.put(`http://aibt.ga/api/accounts`, {
        channel: process.env.TWITCH_CHANNEL.toLocaleLowerCase(),
        token: this.settings.token,
        id: param
      })
      const message = this.settings.accountadded.replace('$id', param)
      return message
    } catch (e) {
      let message = e.response.data.description
      message = message.replace('Account', this.settings.account)
      message = message.replace('is already connected to channel', this.settings.alreadylinked)
      return message
    }
  }

  async delacc (param) {
    try {
      await axios.delete(`http://aibt.ga/api/accounts`, {
        data: {
          channel: process.env.TWITCH_CHANNEL.toLocaleLowerCase(),
          token: this.settings.token,
          id: param
        }
      })
      const message = this.settings.accountdeleted.replace('$id', param)
      return message
    } catch (e) {
      let message = e.response.data.description
      message = message.replace('Account', this.settings.account)
      message = message.replace('is not linked to channel', this.settings.notlinked)
      return message
    }
  }

  async listacc () {
    try {
      const request = await axios(`http://aibt.ga/api/listacc?channel=${process.env.TWITCH_CHANNEL.toLocaleLowerCase()}&token=${this.settings.token}`)
      const response = await request.data
      return response.accounts.join(', ')
    } catch (e) {
      return this.settings.nolinkedaccs
    }
  }

  async medal () {
    try {
      const request = await axios(`http://aibt.ga/api/medal?channel=${process.env.TWITCH_CHANNEL.toLocaleLowerCase()}&token=${this.settings.token}`)
      const response = await request.data
      return response.medal
    } catch (e) {
      return this.settings.nolinkedaccs
    }
  }

  async sockets () {
    const self = this
    io.on('connection', function (socket) {
      socket.on('settings.notable', async (data, cb) => {
        const query = await global.db('settings').select('*').where('system', 'notable').first()
        cb(null, query)
      })
      socket.on('update.settings.notable', async (data, cb) => {
        await global.db('settings').where('system', 'notable').update({ data: data })
        await self.init()
      })
    })
  }
}

module.exports = new Notable()
