
exports.up = function (knex) {
  return knex.schema.createTable('systems.defaultcommands', function (table) {
    table.string('name').unique().notNullable()
    table.boolean('enabled').notNullable()
    table.string('permission').notNullable()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('systems.defaultcommands')
}
