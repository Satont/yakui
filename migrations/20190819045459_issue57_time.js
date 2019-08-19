
exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('users', function (table) {
      table.specificType('lastWatchedPoints', 'numeric').notNullable().default(0)
    }),
    knex('settings').select().where('system', 'users').then((rows) => {
      const actualData = rows[0]
      if (!actualData) return
      actualData.data.pointsWatchedInterval = Number(0)
      return knex('settings').where('system', 'users').update({ data: actualData.data })
    })
  ])
};

exports.down = function(knex) {
  
};
