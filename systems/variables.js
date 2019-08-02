const { io } = require("../libs/panel")
const commons = require('../libs/commons')
const commands = require('./customCommands')
const _ = require('lodash')

class Variables {
  async prepareMessage(response, userstate) {
    let numbersRegexp = /[random]+\((.*?)\)/
    let variableRegexp = /\$_(\S*)/g
    let songRegexp = /\$song(\S*)/g
    response = response.replace('$sender', '@' + userstate['display-name'])
    if (response.includes('$uptime')) {
      response = response.replace('$uptime', commons.prepareUptime())
    }
    if (response.includes('$followtime')) {
      response = response.replace('$followtime', await commons.prepareFollowTime(Number(userstate['user-id'])))
    }
    if (response.includes('$subs')) {
      response = response.replace('$subs', global.tmi.subscribers)
    }
    if (response.includes('$latestSub')) {
      response = response.replace('$latestSub', await commons.getLatestSubOrResub('sub'))
    }
    if (response.includes('$latestReSub')) {
      response = response.replace('$latestReSub', await commons.getLatestSubOrResub('resub'))
    }
    if (response.includes('$commands')) {
      response = response.replace('$commands', commands.commands.map(val => { return '!' + val.name }).join(", "))
    }
    if (response.includes('$song')) {
      let query = response.match(songRegexp)[0].replace('$song?', '')
      response = response.replace(response.match(songRegexp), await commons.getSong(query))
    }
    if (response.includes('$messages') || response.includes('$tips') || response.includes('$bits') || response.includes('$points') || response.includes('$watched') ) {
      let user = await global.db('users').where({ id: Number(userstate['user-id']) })
      if (!user.length) return
      user = user[0]
      response = response.replace('$messages', user.messages)
      response = response.replace('$tips', user.tips)
      response = response.replace('$bits', user.bits)
      response = response.replace('$points', user.points)
      response = response.replace('$watched', shortEnglish(user.watched))
    }
    if (response.includes('$top_messages')) {
      let users = await global.db('users').select('*').orderBy('messages', 'desc').limit(10)
      users = users.map(o => `${o.username} - ${o.messages}`)
      response = response.replace('$top_messages', users.join(', '))
    }
    if (response.includes('$top_watched')) {
      let users = await global.db('users').select('*').orderBy('watched', 'desc').limit(10)
      users = users.map(o => `${o.username} - ${shortEnglish(o.watched)}`)
      response = response.replace('$top_watched', users.join(', '))
    }
    if (response.includes('$top_bits')) {
      let users = await global.db('users').select('*').orderBy('bits', 'desc').limit(10)
      users = users.map(o => `${o.username} - ${o.bits}`)
      response = response.replace('$top_bits', users.join(', '))
    }
    if (response.includes('$top_tips')) {
      let users = await global.db('users').select('*').orderBy('tips', 'desc').limit(10)
      users = users.map(o => `${o.username} - ${o.tips}`)
      response = response.replace('$top_tips', users.join(', '))
    }
    if (response.includes('$top_points')) {
      let users = await global.db('users').select('*').orderBy('points', 'desc').limit(10)
      users = users.map(o => `${o.username} - ${o.points}`)
      response = response.replace('$top_points', users.join(', '))
    }
    if (response.includes('(api|')) {
      response = await commons.parseMessageApi(response)
    }
    if (response.includes('(eval')) {
      response = (await commons.eval(response, userstate.username, userstate['display-name'])).toString()
    }
    if (response.includes('$random')) {
      let numbers = response.replace('$random', 'random').match(numbersRegexp)[1]
      numbers = numbers.split('-')
      numbers = _.random(numbers[0], numbers[1])
      response = response.replace('$', '').replace(/[random]+\((.*?)\)/, numbers)
    }
    // реплейсить кастомную переменную на значение
    if (response.match(variableRegexp)) {
      for (let [index, variable] of response.match(variableRegexp).entries()) {
        let findVariable = (await global.db('systems.variables').where('name', variable.replace('$_', '')))[0]
        response = findVariable ? response.replace(variable, findVariable.value) : response + ''
      }
    }
    return response
  }
}

module.exports = new Variables()

io.on('connection', function (socket) {
  socket.on('list.variables', async (data, cb) => {
    let query = await global.db.select(`*`).from('systems.variables')
    cb(null, query)
  })
  socket.on('create.variable', async (data, cb) => {
    try {
      await global.db('systems.variables').insert(data)
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('delete.variable', async (data, cb) => {
    try {
      await global.db('systems.variables').where('name', data).delete()
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('update.variable', async (data, cb) => {
    let name = data.currentname
    delete data.currentname
    try {
      await global.db('systems.variables').where('name', name).update(data)
    } catch (e) {
      console.log(e)
    }
  })
})