import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('widgets', table => {
    table.increments('id').primary(),
    table.string('name').unique().notNullable(),
    table.integer('left').notNullable(),
    table.integer('top').notNullable(),
    table.integer('width').notNullable(),
    table.integer('height').notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
}

