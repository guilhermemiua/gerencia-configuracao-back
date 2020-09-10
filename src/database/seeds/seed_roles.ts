import * as Knex from 'knex'

export async function seed (knex: Knex): Promise<void> {
  return knex('roles').del()
    .then(() => {
      return knex('roles').insert([
        { id: 1, name: 'admin' },
        { id: 2, name: 'user' }
      ])
    })
};
