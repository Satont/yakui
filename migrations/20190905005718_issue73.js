const { isPlainObject } = require('lodash')

exports.up = function(knex) {
  return Promise.all([
    knex('systems.events').select('*').then(rows => {
      for (let row of rows) {
        if (isPlainObject(row.operations) || !row.operations.length) continue
        for (let operation of row.operations) operation.filter = null
        return Promise.all([
          knex('systems.events').where('name', row.name).update({ operations: JSON.stringify(row.operations) }).catch(console.log)
        ])
      }
    })
  ])
};

exports.down = function(knex) {
  
};
