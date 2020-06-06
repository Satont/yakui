import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return knex.schema.createTable('variables', table => {
    table.increments('id').primary(),
    table.string('name').index().unique().notNullable(),
    table.text('response').notNullable(),
    table.boolean('enabled').defaultTo(true)
  })
}


export async function down(knex: Knex): Promise<any> {
  return knex.schema.dropTable('variables')
}

