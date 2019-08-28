let path = '.env'
switch (process.env.NODE_ENV) {
  case 'development': path = '.env.dev'; break
}
require('dotenv').config({ path: path })

global.db = require('./libs/db')

async function load () {
  if (!global.db.connected) return setTimeout(() => load(), 100)
  global.tmi = require('./libs/tmi')
  require('./libs/panel')

  require('./systems/customCommands')
  require('./systems/variables')
  require('./systems/moderation')
  require('./systems/timers')
  require('./systems/users')
  require('./systems/twitch')
  require('./systems/keywords')
  require('./systems/overlays')
  require('./systems/events')

  require('./integrations/donationalerts')
  require('./integrations/streamlabs')
  require('./integrations/qiwi')
  require('./integrations/spotify')
}
load()

process.on('uncaughtException', function (err) {
  console.log(err)
})

function clearRam () {
  try {
    if (global.gc) global.gc()
  } catch (e) {
    console.log('`node --expose-gc app.js`')
  }
  setTimeout(() => clearRam(), 15 * 60 * 1000)
}
clearRam()
