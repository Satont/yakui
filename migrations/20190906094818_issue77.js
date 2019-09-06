
exports.up = function(knex) {
  return knex.schema.table('systems.commands', table => {
    table.string('cooldownfor').default('global')
  })
};

exports.down = function(knex) {
  
};
