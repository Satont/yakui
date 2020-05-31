import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return await knex.schema.createTable('commands', table => {
    table.increments('id').primary(),
    table.string('name').notNullable().unique(),
    table.json('aliases').defaultTo([]),
    table.integer('cooldown'),
    table.text('description'),
    table.text('response').notNullable(),
    table.boolean('visible').notNullable().defaultTo(true)
  })
}

export async function down(knex: Knex): Promise<any> {
  return await knex.schema.dropTable('commands')
}
