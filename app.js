let path = '.env'
switch (process.env.NODE_ENV) {
  case 'development': path = '.env.dev'; break;
}
require('dotenv').config({ path: path })

global.db = require('./libs/db')

async function load() {
  if (!global.db.connected) return setTimeout(() => load(), 100)
  global.twitch = require('./libs/twitch')
  require('./libs/panel')
  require('./systems/commands')
  require('./systems/variables')
  require('./systems/moderation')
  require('./systems/timers')
  require('./systems/users')
  require('./integrations/donationalerts')
}
load()

process.on('uncaughtException', function (err) {
  console.log(err);
}); 