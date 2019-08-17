
exports.up = function(knex) {
  return knex.schema.table('systems.keywords', function (table) {
    table.specificType('cooldown', 'numeric').notNullable().default(5)
  })
};

exports.down = function(knex) {
  
};
