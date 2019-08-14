const { fastify, io } = require("../libs/panel")
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
    clearInterval(this.refreshInterval)
    this.settings = (await global.db('integrations').select('*').where('name', 'spotify'))[0]
    if (!this.settings.enabled || !this.settings.settings.clientId || !this.settings.settings.clientSecret || !this.settings.settings.redirectUri) return
    if (this.client) this.client = null

    this.client = new SpotifyWebApi(this.settings.settings)
    this.refreshInterval = setInterval(() => this.refreshToken(), 60 * 60 * 1000)
  }
  async generateAuthLink() {
    if (!this.client) return false

    return this.client.createAuthorizeURL(this.scopes)
  }
  async refreshToken() {
    if (!this.client) return
    this.client.refreshAccessToken().then(async data => {
        console.log('Spotify access token was refreshed')
        this.client.setAccessToken(data.body['access_token'])
        this.settings.settings.accessToken = data.body['access_token']
        await global.db('integrations').where('name', 'spotify').update({ settings: this.settings.settings })
      }, err => {
        console.log('Could not refresh access token', err)
      }
    );
  }
  async nowPlaying() {
    if (!this.client) return false
    return this.client.getMyCurrentPlayingTrack({
    }).then(data => {
      return `${data.body.item.artists[0].name} — ${data.body.item.name}`
    }, err => {
      console.log(err)
      return null
    });
  }
  async sockets(data) {
    let self = this
    io.on('connection', function (socket) {
      socket.on('settings.spotify', async (data, cb) => {
        let query = (await global.db('integrations').select('*').where('name', 'spotify'))[0]
        cb(null, query)
      })
      socket.on('spotify.auth', async (data, cb) => {
        let query = await global.db('integrations').where('name', 'spotify').update(data).returning(['enabled', 'settings'])
        self.settings = query[0]
        await self.start()
        let link = await self.generateAuthLink()
        if (!link) return cb('error', null)
        cb(null, link)
      })
    })
  }
  async fastify() {
    let self = this
    fastify.get('/integrations/spotify/callback', function (request, reply) {
      let code = request.query.code
      self.client.authorizationCodeGrant(code).then(async data => {
        self.settings.settings.accessToken = data.body['access_token']
        self.settings.settings.refreshToken = data.body['refresh_token']
        await global.db('integrations').where('name', 'spotify').update({ settings: self.settings.settings })
        self.start()
        reply.redirect(`${request.headers.host}/#/integrations/spotify`)
      }, err => console.log(err))
    })
  }
}

module.exports = new Qiwi()