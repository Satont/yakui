import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  const first = await knex.schema.dropTable('commands_usage')
  const second = await knex.schema.alterTable('commands', table => {
    table.integer('usage').defaultTo(1)
  })

  return [first, second]
}


export async function down(knex: Knex): Promise<any> {
}

