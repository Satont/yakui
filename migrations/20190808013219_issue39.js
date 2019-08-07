
exports.up = function(knex) {
  return knex.schema.createTable('systems.keywords', function (table) {
    table.string('name').notNullable()
    table.string('response').notNullable()
    table.boolean('visible').notNullable().default(true)
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('systems.keywords')
};
