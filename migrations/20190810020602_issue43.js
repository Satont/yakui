
exports.up = function(knex) {
  return knex.schema.createTable('systems.overlays', function (table) {
    table.increments('id').notNullable()
    table.string('name').notNullable()
    table.text('data').notNullable()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('systems.overlays')
};
