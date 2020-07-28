import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('users_daily_messages', table => {
    table.increments('id').primary(),
    table.integer('userId').references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
    table.integer('count').defaultTo(1),
    table.bigInteger('date').notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('users_daily_messages')
}
