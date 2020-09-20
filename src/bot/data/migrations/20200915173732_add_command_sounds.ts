import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('commands_sound', table => {
    table.increments('id').primary(),
    table.integer('volume').defaultTo(50),
    table.integer('commandId').references('id').inTable('commands').onDelete('CASCADE').onUpdate('CASCADE'),
    table.integer('soundId').references('id').inTable('files').onDelete('CASCADE').onUpdate('CASCADE')
  })
}


export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('commands_sound')
}

