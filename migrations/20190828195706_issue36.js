
exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('systems.events', function (table) {
      table.string('name')
      table.json('operations').default([])
    }),
    knex('systems.events').insert({ name: 'tip', operations: []}),
    knex('systems.events').insert({ name: 'sub', operations: []}),
    knex('systems.events').insert({ name: 'resub', operations: []}),
    knex('systems.events').insert({ name: 'subGift', operations: []}),
    knex('systems.events').insert({ name: 'message', operations: []}),
    knex('systems.events').insert({ name: 'chatClear', operations: []}),
    knex('systems.events').insert({ name: 'userJoin', operations: []}),
    knex('systems.events').insert({ name: 'userPart', operations: []}),
    knex('systems.events').insert({ name: 'bits', operations: []}),
    knex('systems.events').insert({ name: 'emoteOnly', operations: []}),
    knex('systems.events').insert({ name: 'hosted', operations: []}),
    knex('systems.events').insert({ name: 'hosting', operations: []}),
    knex('systems.events').insert({ name: 'raided', operations: []}),
    knex('systems.events').insert({ name: 'slowMode', operations: []}),
    knex('systems.events').insert({ name: 'subsOnlyChat', operations: []}),
  ])
};

exports.down = function(knex) {
  
};
