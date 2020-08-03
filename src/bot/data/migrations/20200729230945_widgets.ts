import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('widgets', table => {
    table.increments('id').primary(),
    table.string('name').unique().notNullable(),
    table.integer('x').notNullable(),
    table.integer('y').notNullable(),
    table.integer('w').notNullable(),
    table.integer('h').notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
}

