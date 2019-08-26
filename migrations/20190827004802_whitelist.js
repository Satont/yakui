
exports.up = function(knex) {
  return Promise.all([
    knex('systems.moderation').select().where('name', 'links').then((rows) => {
      const actualData = rows[0]
      if (!actualData) return
      actualData.settings.whitelist = []
      return knex('systems.moderation').where('name', 'links').update({ settings: actualData.settings })
    })
  ])
};

exports.down = function(knex) {
  
};
