import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex.schema.createTable('keywords', table => {
    table.increments('id').primary(),
    table.string('name').notNullable().unique().index(),
    table.text('response').notNullable(),
    table.boolean('enabled').defaultTo(true),
    table.integer('cooldown').defaultTo(30)
  })
}


export async function down(knex: Knex): Promise<any> {
  return await knex.schema.dropTable('keywords')
}

