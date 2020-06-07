import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex.schema.createTable('greetings', table => {
    table.increments('id').primary(),
    table.integer('userId').unique().index(),
    table.string('username').unique().index(),
    table.text('message').notNullable(),
    table.boolean('enabled').defaultTo(true)
  })
}


export async function down(knex: Knex): Promise<any> {
  return await knex.schema.dropTable('greetings')
}

