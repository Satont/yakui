
exports.up = function(knex) {
  return knex.schema.createTable('integrations', function (table) {
    table.string('name').unique().notNullable()
    table.boolean('enabled').notNullable()
    table.json('settings')
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('integrations')
};
