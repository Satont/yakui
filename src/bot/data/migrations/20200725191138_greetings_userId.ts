import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex.schema.table('greetings', table => {
    table.dropUnique(['userId']).dropIndex(['userId']),
    table.dropUnique(['username']).dropIndex(['username'])
  })
}


export async function down(knex: Knex): Promise<any> {
}

