
exports.up = function (knex) {
  return Promise.all([
    knex.schema.table('systems.commands', function (table) {
      return table.increments('id')
    }),
    knex.schema.table('systems.keywords', function (table) {
      return table.increments('id')
    }),
    knex.schema.table('systems.timers', function (table) {
      return table.increments('id')
    }),
    knex.schema.table('systems.variables', function (table) {
      return table.increments('id')
    })
  ])
}

exports.down = function (knex) {

}
