import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex.schema.table('users', table => {
    table.bigInteger('watched').defaultTo(0)
  })
}


export async function down(knex: Knex): Promise<any> {
  return await knex.schema.table('users', table => {
    table.dropColumn('watched')
  })
}

