const _ = require('lodash')
const commons = require('../libs/commons')
const permissions = require('../libs/permissions')
const { io } = require("../libs/panel")
const variables = require('../systems/variables')

class CustomCommands {
  permissions = ['broadcaster', 'moderator', 'subscriber', 'vip', 'viewer']

  constructor() {
    this.cooldowns = []
    this.commands = []
    this.sockets()
    this.getCommands()
  }
  async prepareCommand (message, userstate) {
    let find
    let ar = message.toLowerCase().substring(1).split(' ')
    for (let i = 0, len = ar.length; i < len; i++) {
      let command = this.commands.find(o => o.name === ar.join(' '))
      let aliase = this.commands.find(o => o.aliases.includes(ar.join(' ')))
      if (!command && !aliase) ar.pop()
      else {
        find = command ? command : aliase
        break;
      }
    }
    if (!find) return
    if (this.cooldowns.includes(find.name) && find.cooldowntype === 'stop') {
      return console.log(`COMMAND ${find.name.toUpperCase()} ON COOLDOWN AND HAS NO EXECUTE MODEL`)
    }

    if (await permissions.hasPerm(userstate.badges, find.permission)) await this.prepareMessage(find, find.response, message, userstate)
  }
  async prepareMessage (command, response, message, userstate) {
    let variableRegexp = /\$_(\S*)/g
    let args = message.split(' ')
    // модер меняет переменную в команде
    let wantsChangeVariable = (userstate.mod || (userstate.badges && typeof userstate.badges.broadcaster !== 'undefined')) && args.length >= 2 && command.response.match(variableRegexp) !== null
    if (wantsChangeVariable) {
      args.shift()
      args = args.join(' ')
      let variable = response.match(variableRegexp)[0].replace('$_', '')
      let findVariable = await global.db('systems.variables').where('name', variable).update('value', args)
      if (findVariable) return this.say(`@${userstate['display-name']} ${variable} ===> ${args}`)
    }
    //
    response = await variables.prepareMessage(response, userstate)
    //
    this.respond(command, response, message, userstate)
  }
  async respond (command, message, object, userstate) {
    if (this.cooldowns.includes(command.name) && (userstate.mod || userstate.subscriber)) {
      return await this.say(message)
    } else if (this.cooldowns.includes(command.name) && command.cooldowntype === 'notstop') {
      return await this.whisper(userstate.username, message)
    }
    await this.say(message)
    this.cooldowns.push(command.name)
    setTimeout(() => {
      let index = this.cooldowns.indexOf(command.name)
      if (index !== -1) this.cooldowns.splice(index, 1)
    }, command.cooldown * 1000);
  }
  async getCommands() {
    let query = await global.db.select(`*`).from('systems.commands')
    this.commands = query
    return query
  }
  async say(msg) {
    global.tmi.client.say(process.env.TWITCH_CHANNEL, msg).catch(console.log)
  }
  async whisper(username, message) {
    await global.tmi.client.whisper(username, message).catch(console.log)
  }
  async timeout(username, time) {
    global.tmi.client.timeout(process.env.TWITCH_CHANNEL, username, time).catch(console.log)
  }
  async sockets() {
    let self = this
    io.on('connection', function (socket) {
      socket.on('list.commands', async (data, cb) => {
        let query = await global.db.select(`*`).from('systems.commands')
        cb(null, query)
      })
      socket.on('create.command', async (data, cb) => {
        let aliases = _.flattenDeep(self.commands.map(o => o.aliases))
        let names = self.commands.map(o => o.name)

        if (aliases.some(o => data.aliases.includes(o)) || names.some(o => data.aliases.includes(o))) return cb('Command name or aliase already used', null)
        if (names.some(o => o.name === data.name) || aliases.some(o => names.includes(o))) return cb('Command name or aliase already used', null)
        
        try {
          await global.db('systems.commands').insert(data)
          self.getCommands()
          cb(null, true)
        } catch (e) {
          console.log(e)
        }
      })
      socket.on('delete.command', async (data, cb) => {
        try {
          await global.db('systems.commands').where('name', data).delete()
          self.getCommands()
        } catch (e) {
          console.log(e)
        }
      })
      socket.on('update.command', async (data, cb) => {
        let aliases = _.flattenDeep(self.commands.map(o => o.aliases))
        let names = self.commands.map(o => o.name)

        if (aliases.some(o => data.aliases.includes(o)) || names.some(o => data.aliases.includes(o))) return cb('Command name or aliase already used', null)
        if (names.some(o => o.name === data.name) || aliases.some(o => names.includes(o))) return cb('Command name or aliase already used', null)

        let name = data.currentname.replace('%20', ' ')
        delete data.currentname
        try {
          await global.db('systems.commands').where('name', name).update(data)
          self.getCommands()
          cb(null, true)
        } catch (e) {
          console.log(e)
        }
      })
    })
  }
}

module.exports = new CustomCommands()