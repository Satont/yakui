
exports.up = function(knex) {
  return Promise.all([
    knex('settings').select().where('system', 'users').then((rows) => {
     let actualData = rows[0]
     actualData.data.ignorelist = []
      return knex('settings').where('system', 'users').update({ data: actualData.data })
    })
  ])
};

exports.down = function(knex) {
  
};
