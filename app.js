let path = '.env'
switch (process.env.NODE_ENV) {
  case 'development': path = '.env.dev'; break
}
require('dotenv').config({ path: path })

require('./libs/logger')
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

process.on('unhandledRejection', function (err, promise) {
  global.log.error(require('util').inspect(promise))
})

process.on('uncaughtException', (e) => {
  global.log.error(require('util').inspect(e))
})

function clearRam () {
  try {
    if (global.gc) global.gc()
  } catch (e) {
   global.log.info('`node --expose-gc app.js`')
  }
  setTimeout(() => clearRam(), 15 * 60 * 1000)
}
clearRam()
