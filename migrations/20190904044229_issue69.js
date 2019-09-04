
exports.up = function(knex) {
  return knex.schema.table('systems.commands', table => {
    table.text('description').default("This command have not description")
  })
};

exports.down = function(knex) {
  
};
