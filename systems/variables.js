const { io } = require('../libs/panel')
const commons = require('../libs/commons')
const _ = require('lodash')
const shortEnglish = require('humanize-duration').humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      h: () => 'h'
    }
  },
  units: ['h'],
  spacer: '',
  maxDecimalPoints: 1,
  decimal: '.'
})
const notable = require('./notable')
const users = require('./users')

class Variables {
  async prepareMessage (response, userstate, message) {
    const variableRegexp = /\$_(\S*)/g
    const songRegexp = /\$song(\S*)/g
    if (response.includes('$sender')) {
      response = response.replace('$sender', '@' + userstate['display-name'])
    }
    if (response.includes('$uptime') && !userstate.overlay) {
      response = response.replace('$uptime', commons.prepareUptime())
    }
    if (response.includes('$followtime')) {
      if (message.length) {
        try {
          const target = await users.getIdByUsername(message.replace('@', ''))
          response = `@${userstate['display-name']} ${message} ===> ${await commons.prepareFollowTime(target)}`
        } catch (e) {
          response = `@${userstate['display-name']} Info about ${message} wasn't found`
        }
      } else response = response.replace('$followtime', await commons.prepareFollowTime(Number(userstate['user-id'])))
    }
    if (response.includes('$subs')) {
      response = response.replace('$subs', global.tmi.subscribers)
    }
    if (response.includes('$stream_viewers')) {
      const viewers = global.tmi.streamData ? global.tmi.streamData.viewers : 0
      response = response.replace('$stream_viewers', viewers)
    }
    if (response.includes('$stream_game')) {
      const game = global.tmi.channelData ? global.tmi.channelData.game : 'no info'
      response = response.replace('$stream_game', game)
    }
    if (response.includes('$stream_title')) {
      const title = global.tmi.channelData ? global.tmi.channelData.status : 'no info'
      response = response.replace('$stream_title', title)
    }
    if (response.includes('$channel_views')) {
      const views = global.tmi.channelData ? global.tmi.channelData.views : 'no info'
      response = response.replace('$channel_views', views)
    }
    if (response.includes('$channel_followers')) {
      const followers = global.tmi.channelData ? global.tmi.channelData.followers : 'no info'
      response = response.replace('$channel_followers', followers)
    }
    if (response.includes('$latestSub')) {
      response = response.replace('$latestSub', await commons.getLatestSubOrResub('sub'))
    }
    if (response.includes('$latestReSub')) {
      response = response.replace('$latestReSub', await commons.getLatestSubOrResub('resub'))
    }
    if (response.includes('$commands')) {
      let commands = []
      for (let [, system] of Object.entries(global.systems)) {
        if (typeof system.commands === 'undefined') continue
        commands.push(system.commands.filter(o => o.visible))
      }
      response = response.replace('$commands', _.flattenDeep(commands).map(o => { return `!${o.name}`}).join(', '))
    }
    if (response.includes('$song')) {
      const query = response.match(songRegexp)[0].replace('$song?', '')
      response = response.replace(response.match(songRegexp), await commons.getSong(query))
    }
    if (response.includes('$param')) {
      if (!message.length) response = response.replace('$param', '?')
      else response = response.replace('$param', message)
    }
    if (response.includes('$np')) {
      response = response.replace('$np', await notable.np())
    }
    if (response.includes('$lastgame')) {
      response = response.replace('$lastgame', await notable.lastgame())
    }
    if (response.includes('$gammedals')) {
      response = response.replace('$gammedals', await notable.gammedals())
    }
    if (response.includes('$score')) {
      response = response.replace('$score', await notable.score())
    }
    if (response.includes('$addacc')) {
      response = await notable.addacc(message)
    }
    if (response.includes('$delacc')) {
      response = await notable.delacc(message)
    }
    if (response.includes('$listacc')) {
      response = response.replace('$listacc', await notable.listacc())
    }
    if (response.includes('$medal')) {
      response = response.replace('$medal', await notable.medal())
    }
    if (response.includesOneOf(['$messages', '$tips', '$bits', '$points', '$watched', '$pointsName'])) {
      const raw = `select * from users join (select id, row_number() over (order by "watched" desc) as watched_position, row_number() over (order by "messages" desc) as messages_position, row_number() over (order by "tips" desc) as tips_position, row_number() over (order by "bits" desc) as bits_position, row_number() over (order by "points" desc) as points_position from users) as ranked_users on ranked_users.id = users.id where users.id = ?`
      let user
      if (message.length) {
        try {
          const target = await users.getIdByUsername(message.replace('@', ''))
          user = await global.db.raw(raw, [target])
        } catch (e) {
          user = {}
          user.rows = []
          response = `@${userstate['display-name']} user ${message} not found on twitch`
        }
      }
      else user = await global.db.raw(raw, [Number(userstate['user-id'])])
      if (!user.rows.length) user = {}
      else user = user.rows[0]
      user.positions = {
        messages: _.get(user, 'messages_position', 0) === 0 ? '' : `(#${user.messages_position})`,
        tips: _.get(user, 'tips_position', 0) === 0 ? '' : `(#${user.tips_position})`,
        bits: _.get(user, 'bits_position', 0) === 0 ? '' : `(#${user.bits_position})`,
        points: _.get(user, 'points_position', 0) === 0 ? '' : `(#${user.points_position})`,
        watched: _.get(user, 'watched_position', 0) === 0 ? '' : `(#${user.watched_position})`
      }
      response = response.replace('$messages', `${_.get(user, 'messages', 0)} ${user.positions.messages}`)
      .replace('$tips', `${_.get(user, 'tips', 0)} ${user.positions.tips}`)
      .replace('$bits', `${_.get(user, 'bits', 0)} ${user.positions.bits}`)
      .replace('$points', `${_.get(user, 'points', 0)} ${user.positions.points}`)
      .replace('$watched', `${shortEnglish(_.get(user, 'watched', 0))} ${user.positions.messages}`)
      .replace('$pointsName', commons.declOfNum(user.points, users.settings.pointsName.split('|')))
    }
    if (response.includes('$top_messages')) {
      const ignoredUsers = (await global.db('settings').select('*').where('system', 'users').first()).data.ignorelist
      let users = await global.db('users').select('*').orderBy('messages', 'desc').limit(10).whereNotIn('username', ignoredUsers).whereNot('id', global.tmi.channelID)
      users = users.map(o => `${users.indexOf(o) + 1}. ${o.username} - ${o.messages}`)
      response = response.replace('$top_messages', users.join(', '))
    }
    if (response.includes('$top_watched')) {
      const ignoredUsers = (await global.db('settings').select('*').where('system', 'users').first()).data.ignorelist
      let users = await global.db('users').select('*').orderBy('watched', 'desc').limit(10).whereNotIn('username', ignoredUsers).whereNot('id', global.tmi.channelID)
      users = users.map(o => `${users.indexOf(o) + 1}. ${o.username} - ${shortEnglish(o.watched)}`)
      response = response.replace('$top_watched', users.join(', '))
    }
    if (response.includes('$top_bits')) {
      const ignoredUsers = (await global.db('settings').select('*').where('system', 'users').first()).data.ignorelist
      let users = await global.db('users').select('*').orderBy('bits', 'desc').limit(10).whereNotIn('username', ignoredUsers).whereNot('id', global.tmi.channelID)
      users = users.map(o => `${users.indexOf(o) + 1}. ${o.username} - ${o.bits}`)
      response = response.replace('$top_bits', users.join(', '))
    }
    if (response.includes('$top_tips')) {
      const ignoredUsers = (await global.db('settings').select('*').where('system', 'users').first()).data.ignorelist
      let users = await global.db('users').select('*').orderBy('tips', 'desc').limit(10).whereNotIn('username', ignoredUsers).whereNot('id', global.tmi.channelID)
      users = users.map(o => `${users.indexOf(o) + 1}. ${o.username} - ${o.tips}`)
      response = response.replace('$top_tips', users.join(', '))
    }
    if (response.includes('$top_points')) {
      const ignoredUsers = (await global.db('settings').select('*').where('system', 'users').first()).data.ignorelist
      let users = await global.db('users').select('*').orderBy('points', 'desc').limit(10).whereNotIn('username', ignoredUsers).whereNot('id', global.tmi.channelID)
      users = users.map(o => `${users.indexOf(o) + 1}. ${o.username} - ${o.points}`)
      response = response.replace('$top_points', users.join(', '))
    }
    if (response.includes('(api|')) {
      response = await commons.parseMessageApi(response)
    }
    if (response.includes('(eval')) {
      response = (await commons.eval(response, userstate, message))
    }

    if (response.includes('(random.')) {
      const randomRegex = /[(]random\.\d{1,100}[-]\d{1,100}[)]/ig
      const exec = randomRegex.exec(response)
      if (exec) {
        const numbers = exec[0].replace('(random.', '').replace(')', '').trim().split('-')
        response = response.replace(exec[0], _.random(numbers[0], numbers[1]))
      }
    }
    if (response.includes('(random.viewer)')) {
      const filteredUsers = users.onlineUsers.filter(o => !users.settings.ignorelist.includes(o.username.toLowerCase()))
      if (filteredUsers.length) response = response.replace('(random.viewer)', _.sample(filteredUsers).username)
    }
    // реплейсить кастомную переменную на значение
    if (response.match(variableRegexp)) {
      for (const [index, variable] of response.match(variableRegexp).entries()) {
        const findVariable = (await global.db('systems.variables').where('name', variable.replace('$_', '')))[0]
        response = findVariable ? response.replace(variable, findVariable.value) : response + ''
      }
    }
    return response
  }
}

module.exports = new Variables()

io.on('connection', function (socket) {
  socket.on('list.variables', async (data, cb) => {
    const query = await global.db.select(`*`).from('systems.variables')
    cb(null, query)
  })
  socket.on('create.variable', async (data, cb) => {
    try {
      await global.db('systems.variables').insert(data)
    } catch (e) {
      global.log.error(e)
    }
  })
  socket.on('delete.variable', async (data, cb) => {
    try {
      await global.db('systems.variables').where('name', data).delete()
    } catch (e) {
      global.log.error(e)
    }
  })
  socket.on('update.variable', async (data, cb) => {
    const name = data.currentname
    delete data.currentname
    try {
      await global.db('systems.variables').where('name', name).update(data)
    } catch (e) {
      global.log.error(e)
    }
  })
})
