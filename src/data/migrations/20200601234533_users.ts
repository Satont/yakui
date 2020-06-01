import * as Knex from "knex";


export async function up(knex: Knex): Promise<any> {
  return await Promise.all([
    knex.schema.createTable('users', table => {
      table.integer('id').primary().unique().notNullable(),
      table.string('username').index(),
      table.integer('messages').defaultTo(0)
    }),
    knex.schema.createTable('users_tips', table => {
      table.increments('id').primary(),
      table.float('amount', 2).notNullable(),
      table.float('inMainCurrencyAmount', 2).notNullable(),
      table.json('rates').notNullable(),
      table.string('currency').notNullable(),
      table.text('message'),
      table.bigInteger('timestamp').notNullable(),
      table.integer('userId').references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
    }),
    knex.schema.createTable('users_bits', table => {
      table.increments('id').primary(),
      table.bigInteger('amount').notNullable(),
      table.text('message'),
      table.bigInteger('timestamp').notNullable(),
      table.integer('userId').references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')
    })
  ])
}


export async function down(knex: Knex): Promise<any> {
  return await Promise.all([
    knex.schema.dropTable('users'),
    knex.schema.dropTable('users_tips'),
    knex.schema.dropTable('users_bits'),
  ])
}

