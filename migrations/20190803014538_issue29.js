
exports.up = function(knex) {
  return Promise.all([
    knex('systems.moderation').select().where('name', 'links').then((rows) => {
      let actualData = rows[0]
      if (!actualData) return
      actualData.settings.warnMessage = '$sender links disallowed [warn]'
      actualData.settings.timeoutMessage = '$sender links disallowed'
       return knex('systems.moderation').where('name', 'links').update({ settings: actualData.settings })
     }),
    knex('systems.moderation').select().where('name', 'symbols').then((rows) => {
      let actualData = rows[0]
      if (!actualData) return
      actualData.settings.warnMessage = '$sender to many symbols [warn]'
      actualData.settings.timeoutMessage = '$sender to many symbols'
       return knex('systems.moderation').where('name', 'symbols').update({ settings: actualData.settings })
     }),
    knex('systems.moderation').select().where('name', 'longMessage').then((rows) => {
      let actualData = rows[0]
      if (!actualData) return
      actualData.settings.warnMessage = '$sender to long message [warn]'
      actualData.settings.timeoutMessage = '$sender to long message'
       return knex('systems.moderation').where('name', 'longMessage').update({ settings: actualData.settings })
     }),
    knex('systems.moderation').select().where('name', 'caps').then((rows) => {
      let actualData = rows[0]
      if (!actualData) return
      actualData.settings.warnMessage = '$sender to many caps [warn]'
      actualData.settings.timeoutMessage = '$sender to many caps'
       return knex('systems.moderation').where('name', 'caps').update({ settings: actualData.settings })
     }),
    knex('systems.moderation').select().where('name', 'color').then((rows) => {
      let actualData = rows[0]
      if (!actualData) return
      actualData.settings.warnMessage = '$sender /me disallowed [warn]'
      actualData.settings.timeoutMessage = '$sender /me disallowed'
       return knex('systems.moderation').where('name', 'color').update({ settings: actualData.settings })
     }),
    knex('systems.moderation').select().where('name', 'emotes').then((rows) => {
     let actualData = rows[0]
     if (!actualData) return
     actualData.settings.warnMessage = '$sender to many emotes [warn]'
     actualData.settings.timeoutMessage = '$sender to many emotes'
      return knex('systems.moderation').where('name', 'emotes').update({ settings: actualData.settings })
    })
  ])
};

exports.down = function(knex) {
  
};
