const { fastify, io } = require("../libs/panel")
const axios = require('axios')
const SpotifyWebApi = require('spotify-web-api-node')

class Qiwi {
  scopes = [
    'user-read-currently-playing',
    'user-read-private',
    'user-read-email',
    'playlist-modify-public',
    'playlist-modify',
    'playlist-read-collaborative',
    'playlist-modify-private',
    'playlist-read-private',
    'user-modify-playback-state'
  ]

  constructor() {
    this.start()
    this.sockets()
    this.fastify()
  }
  async start () {
    this.settings = (await global.db('integrations').select('*').where('name', 'spotify'))[0]
    if (!this.settings.enabled || !this.settings.settings.clientId || this.settings.settings.clientSecret || this.settings.settings.redirectUri) return
    
    this.client = new SpotifyWebApi(this.settings.settings)
  }
  async generateAuthLink() {
    if (!this.client) return
    delete data.access_token; delete data.refresh_token

    return this.client.createAuthorizeURL(this.scopes)
  }
  async sockets(data) {
    let self = this
    io.on('connection', function (socket) {
      socket.on('settings.spotify', async (data, cb) => {
        let query = (await global.db('integrations').select('*').where('name', 'spotify'))[0]
        cb(null, query)
      })
      socket.on('update.settings.spotify', async (data, cb) => {
        await global.db('integrations').where('name', 'spotify').update(data)
      })
      socket.on('spotify.generateAuthLink', async (data, cb) => {
        self.generateAuthLink(data)
      })
    })
  }
  async fastify() {
    fastify.get('/integrations/spotify/callback', function (request, reply) {
      reply.sendFile('commands.html')
    })
  }
}

module.exports = new Qiwi()