const fs = require('fs')
const dotenv = require('dotenv')
if (process.env.NODE_ENV === 'development') {
  const development = dotenv.parse(fs.readFileSync('.env.dev'))
  for (let k in development) {
    process.env[k] = development[k]
  }
} else dotenv.config()

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