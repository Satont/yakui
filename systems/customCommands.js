const _ = require('lodash')
const { io } = require('../libs/panel')
const variables = require('../systems/variables')

class CustomCommands {
  commands = []

  constructor () {
    this.sockets()
    this.getCommands()
  }

  async prepareMessage (userstate, message, response) {
    const variableRegexp = /\$_(\S*)/g
    // модер меняет переменную в команде
    const wantsChangeVariable = (userstate.mod || (userstate.badges && typeof userstate.badges.broadcaster !== 'undefined')) && message.length && response.match(variableRegexp) !== null
    if (wantsChangeVariable) {
      const variable = response.match(variableRegexp)[0].replace('$_', '')
      const findVariable = await global.db('systems.variables').where('name', variable).update('value', message)
      if (findVariable) return this.say(`@${userstate['display-name']} ${variable} ===> ${message}`)
    }
    //
    response = await variables.prepareMessage(response, userstate, message)
    //
    this.respond(response, userstate)
  }

  async respond (response, userstate) {
    if (userstate['message-type'] === 'whisper') this.whisper(userstate.username, response)
    else this.say(response)
  }

  async getCommands () {
    const query = await global.db.select(`*`).from('systems.commands')
    let arr = []
    for (let command of query) {
      command.fnc = this.prepareMessage
      arr.push(command)
    }
    this.commands = arr
    return query
  }

  async say (msg) {
    global.log.chatOut(msg)
    if (process.env.NODE_ENV !== 'production') return
    global.tmi.client.say(process.env.TWITCH_CHANNEL, msg).catch(global.log.error)
  }

  async whisper (username, message) {
    global.log.whisperOut(`${username} ${message}`)
    if (process.env.NODE_ENV !== 'production') return
    await global.tmi.client.whisper(username, message).catch(global.log.error)
  }

  async timeout (username, time) {
    global.log.chatOut(username, time)
    if (process.env.NODE_ENV !== 'production') return
    global.tmi.client.timeout(process.env.TWITCH_CHANNEL, username, time).catch(global.log.error)
  }

  async sockets () {
    const self = this
    io.on('connection', function (socket) {
      socket.on('list.commands', async (data, cb) => {
        const query = await global.db.select(`*`).from('systems.commands')
        cb(null, query)
      })
      socket.on('create.command', async (data, cb) => {
        const aliases = _.flattenDeep(self.commands.map(o => o.aliases))
        const names = self.commands.map(o => o.name)
        
        const name_exist = _.some(aliases, o => o === data.name) || _.some(names, o => o === data.name)
        const aliase_exist = _.some(names, o => data.aliases.includes(o)) || _.some(aliases, o => data.aliases.includes(o))
      
        if (name_exist || aliase_exist) return cb('Command name or aliase already used', null)

        try {
          await global.db('systems.commands').insert(data)
          await self.getCommands()
          cb(null, true)
        } catch (e) {
          global.log.error(e)
        }
      })
      socket.on('delete.command', async (data, cb) => {
        try {
          await global.db('systems.commands').where('name', data).delete()
          await self.getCommands()
        } catch (e) {
          global.log.error(e)
        }
      })
      socket.on('update.command', async (data, cb) => {
        const aliases = _.flattenDeep(self.commands.filter(o => o.id !== data.id).map(o => o.aliases))
        const names = self.commands.filter(o => o.id !== data.id).map(o => o.name)

        const name_exist = _.some(aliases, o => o === data.name) || _.some(names, o => o === data.name)
        const aliase_exist = _.some(names, o => data.aliases.includes(o)) || _.some(aliases, o => data.aliases.includes(o))
        
        if (name_exist || aliase_exist) return cb('Command name or aliase already used', null)

        try {
          await global.db('systems.commands').where('id', data.id).update(data)
          await self.getCommands()
          cb(null, true)
        } catch (e) {
          global.log.error(e)
        }
      })
    })
  }
}

module.exports = new CustomCommands()
