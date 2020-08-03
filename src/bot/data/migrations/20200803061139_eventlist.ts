import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('eventlist', table => {
    table.increments('id').primary(),
    table.string('name').notNullable(),
    table.json('data').notNullable(),
    table.bigInteger('timestamp').notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('eventlist')
}

