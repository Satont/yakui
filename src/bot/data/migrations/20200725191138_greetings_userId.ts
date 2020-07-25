import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex.schema.table('greetings', table => {
    table.dropUnique(['userId', 'username']).dropIndex(['userId', 'username'])
  })
}


export async function down(knex: Knex): Promise<any> {
}

