exports.seed = function (knex) {
  return Promise.all([
    knex('systems.moderation').select().where('name', 'links').then((rows) => {
      if (rows.length > 0) return
      return knex('systems.moderation').insert({ name: 'links', enabled: false, settings: { moderateSubscribers: false, timeout: 600, warnMessage: '$sender links disallowed [warn]', timeoutMessage: '$link disallowed' } })
    }),
    knex('systems.moderation').select().where('name', 'symbols').then((rows) => {
      if (rows.length > 0) return
      return knex('systems.moderation').insert({ name: 'symbols', enabled: false, settings: { 
        moderateSubscribers: false, triggerLength: 20, maxSymbolsPercent: 65, timeout: 600,
        warnMessage: '$sender to many symbols [warn]', timeoutMessage: '$sender to many symbols'
       } })
    }),
    knex('systems.moderation').select().where('name', 'longMessage').then((rows) => {
      if (rows.length > 0) return
      return knex('systems.moderation').insert({ name: 'longMessage', enabled: false, settings: { 
        moderateSubscribers: false, triggerLength: 300, timeout: 600,
        warnMessage: '$sender to long message [warn]', timeoutMessage: '$sender to long message'
       } })
    }),
    knex('systems.moderation').select().where('name', 'caps').then((rows) => {
      if (rows.length > 0) return
      return knex('systems.moderation').insert({ name: 'caps', enabled: false, settings: { 
        moderateSubscribers: false, triggerLength: 15, maxCapsPercent: 50, timeout: 600,
        warnMessage: '$sender to many caps [warn]', timeoutMessage: '$sender to many caps'
       } })
    }),
    knex('systems.moderation').select().where('name', 'color').then((rows) => {
      if (rows.length > 0) return
      return knex('systems.moderation').insert({ name: 'color', enabled: false, settings: { 
        moderateSubscribers: false, timeout: 600,
        warnMessage: '$sender /me disallowed [warn]', timeoutMessage: '$sender /me disallowed'
       } })
    }),
    knex('systems.moderation').select().where('name', 'emotes').then((rows) => {
      if (rows.length > 0) return
      return knex('systems.moderation').insert({ name: 'emotes', enabled: false, settings: { 
        moderateSubscribers: false, maxCount: 6, timeout: 600,
        warnMessage: '$sender to many emotes [warn]', timeoutMessage: '$sender to many emotes'
       } })
    }),
    knex('systems.moderation').select().where('name', 'main').then((rows) => {
      if (rows.length > 0) return
      return knex('systems.moderation').insert({ name: 'main', enabled: false, settings: { salt: 123 } })
    }),
    knex('systems.moderation').select().where('name', 'blacklist').then((rows) => {
      if (rows.length > 0) return
      return knex('systems.moderation').insert({ name: 'blacklist', enabled: true, settings: { list: [] } })
    }),
    knex('core.subscribers').select().where('name', 'count').then((rows) => {
      if (rows.length > 0) return
      return knex('core.subscribers').insert({ name: 'count', value: '0' })
    }),
    knex('core.subscribers').select().where('name', 'latestSubscriber').then((rows) => {
      if (rows.length > 0) return
      return knex('core.subscribers').insert({ name: 'latestSubscriber', value: 'n/a' })
    }),
    knex('core.subscribers').select().where('name', 'latestReSubscriber').then((rows) => {
      if (rows.length > 0) return
      return knex('core.subscribers').insert({ name: 'latestReSubscriber', value: 'n/a' })
    }),
    knex('core.tokens').select().where('name', 'bot').then((rows) => {
      if (rows.length > 0) return
      return knex('core.tokens').insert({ name: 'bot', value: 'noinformation' })
    }),
    knex('core.tokens').select().where('name', 'broadcaster').then((rows) => {
      if (rows.length > 0) return
      return knex('core.tokens').insert({ name: 'broadcaster', value: 'noinformation' })
    }),
    knex('settings').select().where('system', 'users')
      .then((rows) => {
        if (rows.length > 0) return
        return knex('settings').insert({ system: 'users', data: { enabled: false, pointsPerMessage: 0, pointsPerTime: 0, ignorelist: [] } })
      }),
    knex('integrations').select().where('name', 'donationalerts')
      .then((rows) => {
        if (rows.length > 0) return
        return knex('integrations').insert({ name: 'donationalerts', enabled: false, settings: { token: null } })
      }),
    knex('integrations').select().where('name', 'streamlabs')
      .then((rows) => {
        if (rows.length > 0) return
        return knex('integrations').insert({ name: 'streamlabs', enabled: false, settings: { token: null } })
      }),
    knex('integrations').select().where('name', 'qiwi')
      .then((rows) => {
        if (rows.length > 0) return
        return knex('integrations').insert({ name: 'qiwi', enabled: false, settings: { token: null } })
      }),
    knex('systems.defaultcommands').select().where('name', 'title')
      .then((rows) => {
        if (rows.length > 0) return
        return knex('systems.defaultcommands').insert({ name: 'title', enabled: true, permission: 'moderator' })
      }),
      knex('systems.defaultcommands').select().where('name', 'game')
      .then((rows) => {
        if (rows.length > 0) return
        return knex('systems.defaultcommands').insert({ name: 'game', enabled: true, permission: 'moderator' })
      }),
      knex('settings').select().where('system', 'notable')
      .then((rows) => {
        if (rows.length > 0) return
        return knex('settings').insert({ system: 'notable', data: { 
          enabled: false, token: null, 
          notable: '$gamemode ~$mmr mmr: $list',
          lastgametext: 'Players from past game: $list',
          medalstext: 'Medals in this game: $list',
          scoretext: 'Wins: $wins, Loses: $lose',
          gamenotfound: "Game wasn't found",
          nonotable: 'Notableplayers not found',
          wason: 'was on',
          noplayersfromlastgame: 'Not playing with anyone from last game',
          streamoffline: 'Stream is not live',
          accountadded: 'Account $id was successfuly added!',
          account: 'Account',
          alreadylinked: 'is already connected to channel',
          accountdeleted: 'Account $id was successfuly deleted!',
          accountnotlinked: 'is not linked to channel',
          nolinkedaccs: 'Here is no linked accs'
         } })
      }),
      knex('integrations').select().where('name', 'spotify').then((rows) => {
        if (rows[0]) return
        return knex('integrations').where('name', 'spotify').insert({ name: 'spotify', enabled: false, settings: { clientId: null, clientSecret: null, redirectUri: null, accessToken: null, refreshToken: null } })
       })
    ]);
};
