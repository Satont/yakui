
exports.up = function(knex) {
  return knex.schema.table('systems.commands', function (table) {
    table.boolean('visible').notNullable().default(true)
  })
};

exports.down = function(knex) {
  
};
