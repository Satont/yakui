const fs = require('fs')
let path = '.env'
switch (process.env.NODE_ENV) {
  case 'development': path = '.env.dev'; break;
}
require('dotenv').config({ path: path })

global.db = require('./libs/db')
global.commands = new Map()

async function load() {
  if (!global.db.connected) return setTimeout(() => load(), 100)
  global.tmi = require('./libs/tmi')
  require('./libs/panel')
  require('./systems/customCommands')
  require('./systems/variables')
  require('./systems/moderation')
  require('./systems/timers')
  require('./systems/users')
  require('./systems/twitch')
  require('./integrations/donationalerts')
  require('./integrations/streamlabs')
  require('./integrations/qiwi')
  loadCommands()
}
load()

async function loadCommands() {
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    console.log(`COMMAND ${command.name.toUpperCase()} WAS LOADED`)
    global.commands.set(command.name, command)
  }
  console.log(global.commands)
}

process.on('uncaughtException', function (err) {
  console.log(err);
}); 