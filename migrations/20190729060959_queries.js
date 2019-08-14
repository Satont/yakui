
exports.up = async function (knex) {
  await knex.raw('CREATE SCHEMA IF NOT EXISTS systems')
  await knex.raw('CREATE SCHEMA IF NOT EXISTS core')

  return knex.schema.createTable('systems.commands', function (table) {
    table.string('name').unique().notNullable()
    table.text('response').notNullable()
    table.integer('cooldown').default(0)
    table.string('cooldowntype').default('notstop')
    table.specificType('aliases', 'text[]')
  }).createTable('systems.moderation', table => {
    table.string('name').unique()
    table.boolean('enabled')
    table.json('settings')
  }).createTable('systems.timers', table => {
    table.string('name').unique().notNullable()
    table.boolean('enabled')
    table.integer('interval')
    table.specificType('responses', 'text[]')
    table.integer('last')
    table.string('triggertimestamp')
  }).createTable('systems.variables', table => {
    table.string('name').unique()
    table.text('value')
  }).createTable('core.tokens', table => {
    table.string('name')
    table.string('value')
  }).createTable('core.subscribers', table => {
    table.string('name')
    table.string('value')
  }).createTable('settings', table => {
    table.string('system').unique().notNullable()
    table.json('data')
  }).createTable('users', function (table) {
    table.integer('id').unique().primary().notNullable().index()
    table.string('username').unique().notNullable()
    table.integer('messages').defaultTo(0)
    table.integer('points').defaultTo(0)
    table.specificType('watched', 'numeric').defaultTo(0)
    table.integer('bits').defaultTo(0)
    table.specificType('tips', 'numeric').defaultTo(0)
  })
}

exports.down = function (knex) {

}
