import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await knex.schema.createTable('commands_usage', table => {
    table.increments('id').primary(),
    table.string('name').index().notNullable()
  })
}


export async function down(knex: Knex): Promise<any> {
  return await knex.schema.dropTable('commands_usage')
}

