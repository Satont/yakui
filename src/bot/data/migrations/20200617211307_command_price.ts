import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex.schema.table('commands', table => {
    table.integer('price').defaultTo(0)
  })
}


export async function down(knex: Knex): Promise<any> {
  return knex.schema.table('commands', table => {
    table.dropColumn('price')
  })
}

