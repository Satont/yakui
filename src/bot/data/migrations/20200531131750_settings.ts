import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  return await knex.schema.createTable('settings', table => {
    table.increments('id').primary(),
    table.string('space').notNullable(),
    table.string('name').notNullable(),
    table.text('value').notNullable(),
    table.unique(['space', 'name'])
  })
}

export async function down(knex: Knex): Promise<any> {
  return await knex.schema.dropTable('settings')
}
