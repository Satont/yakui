
exports.up = function (knex) {
  return knex.schema.table('systems.commands', function (table) {
    table.string('permission').notNullable().default('viewer')
  })
}

exports.down = function (knex) {
  return knex.schema.table('systems.commands', function (table) {
    table.dropColumen('permission')
  })
}
