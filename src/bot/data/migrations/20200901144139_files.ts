import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('files', table => {
    table.increments('id').primary(),
    table.string('name').notNullable(),
    table.string('type').notNullable(),
    table.string('data').notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('files')
}

