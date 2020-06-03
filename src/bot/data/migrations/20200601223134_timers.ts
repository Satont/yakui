import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex.schema.createTable('timers', table => {
    table.increments('id').primary(),
    table.string('name').notNullable(),
    table.boolean('enabled').defaultTo(true),
    table.integer('interval').notNullable(),
    table.json('responses').defaultTo([]),
    table.integer('last').defaultTo(0),
    table.bigInteger('triggerTimeStamp').defaultTo(0)
  })
}


export async function down(knex: Knex): Promise<any> {
  return await knex.schema.dropTable('timers')
}

