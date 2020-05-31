import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex.schema.table('commands', table => {
    table.enum('permission', ['viewers', 'followers', 'vips', 'subscribers', 'moderators', 'broadcaster']).defaultTo('viewers')
  })
}


export async function down(knex: Knex): Promise<any> {
  return await knex.schema.table('commands', table => {
    table.dropColumn('permission')
  })
}

