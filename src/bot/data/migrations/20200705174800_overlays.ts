import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex.schema.createTable('overlays', table => {
    table.increments('id').primary(),
    table.string('name').notNullable(),
    table.text('data').notNullable(),
    table.text('css'),
    table.json('js').defaultTo([])
  })
}


export async function down(knex: Knex): Promise<any> {
  return await knex.schema.dropTable('overlays')
}

