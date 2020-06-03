import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex.schema.createTable('events', table => {
    table.increments('id').primary(),
    table.string('name').unique().notNullable(),
    table.json('operations').defaultTo([])
  })
}


export async function down(knex: Knex): Promise<any> {
  return await knex.schema.dropTable('events')
}

