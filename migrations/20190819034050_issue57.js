
exports.up = function(knex) {
  return Promise.all([
    knex.schema.table('users', function (table) {
      table.integer('lastMessagePoints').notNullable().default(0)
    }),
    knex('settings').select().where('system', 'users').then((rows) => {
      const actualData = rows[0]
      if (!actualData) return
      actualData.data.pointsMessageInterval = Number(0)
      actualData.data.pointsTimeInterval = Number(0)
      actualData.data.pointsPerMessage = Number(0)
      return knex('settings').where('system', 'users').update({ data: actualData.data })
    })
  ])
};

exports.down = function(knex) {
  
};
