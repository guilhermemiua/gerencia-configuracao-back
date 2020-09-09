import * as Knex from 'knex'

export async function up (knex: Knex): Promise<void> {
  return knex.schema.alterTable('users', (table: Knex.TableBuilder) => {
    table
      .integer('role_id')
      .references('id')
      .inTable('roles')
      .notNullable()
  })
}

export async function down (knex: Knex): Promise<void> {
  return knex.schema.alterTable('users', (table: Knex.TableBuilder) => {
    table.dropForeign(['role_id'])
    table.dropColumn('role_id')
  })
}
