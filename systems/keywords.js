const variables = require('./variables')
const { io } = require('../libs/panel')
const { say } = require('./customCommands')

class Keywords {
  parsers = [
    { name: 'message', fnc: this.onMessage }
  ]
  
  constructor () {
    this.keywords = []
    this.cooldowns = []
    this.sockets()
    this.getKeywordsList()
  }

  async onMessage (userstate, message) {
    message = message.toLowerCase()
    for (const item of this.keywords) {
      if (message.includes(item.name)) return this.respond(item, message, userstate)
    }
  }

  async respond (item, message, userstate) {
    if (this.cooldowns.includes(item.name)) return
    else {
      this.cooldowns.push(item.name)
      setTimeout(() => {
        const index = this.cooldowns.indexOf(item.name)
        if (index !== -1) this.cooldowns.splice(index, 1)
      }, item.cooldown * 1000)
    }
    let response = item.response
    response = await variables.prepareMessage(response, userstate, message)
    await say(response)
  }

  async getKeywordsList () {
    const query = await global.db.select(`*`).from('systems.keywords')
    this.keywords = query
    return query
  }

  async sockets () {
    const self = this
    io.on('connection', function (socket) {
      socket.on('list.keywords', async (data, cb) => {
        const query = await global.db.select(`*`).from('systems.keywords')
        cb(null, query)
      })
      socket.on('create.keyword', async (data, cb) => {
        try {
          await global.db('systems.keywords').insert(data)
          await self.getKeywordsList()
          cb(null, true)
        } catch (e) {
          global.log.error(e)
        }
      })
      socket.on('delete.keyword', async (data, cb) => {
        try {
          await global.db('systems.keywords').where('id', data).delete()
          await self.getKeywordsList()
        } catch (e) {
          global.log.error(e)
        }
      })
      socket.on('update.keyword', async (data, cb) => {
        try {
          await global.db('systems.keywords').where('id', data.id).update(data)
          await self.getKeywordsList()
          cb(null, true)
        } catch (e) {
          global.log.error(e)
        }
      })
    })
  }
}

module.exports = new Keywords()
