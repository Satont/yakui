import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex.schema.table('users', table => {
    table.bigInteger('points').defaultTo(0)
    table.bigInteger('lastMessagePoints').defaultTo(1)
  })
}


export async function down(knex: Knex): Promise<any> {
  return await knex.schema.table('users', table => {
    table.dropColumn('watched'),
    table.dropColumn('lastMessagePoints')
  })
}

