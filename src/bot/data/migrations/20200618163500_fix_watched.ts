import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex('users').update({ watched: 0 })
}


export async function down(knex: Knex): Promise<any> {
}

