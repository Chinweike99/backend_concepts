/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// exports.up = function(knex) {
  
// };

// /**
//  * @param { import("knex").Knex } knex
//  * @returns { Promise<void> }
//  */
// exports.down = function(knex) {
  
// };


export function up(knex) {
  return knex.schema.createTable('transactions', table => {
    table.increments('id').primary();

    table.integer('wallet_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');

    table.enum('type', ['credit', 'debit', 'transfer'])
      .notNullable();

    table.decimal('amount', 14, 2).notNullable();

    table.string('reference').unique().notNullable();

    table.decimal('previous_balance', 14, 2).notNullable();
    table.decimal('current_balance', 14, 2).notNullable();

    table.json('metadata'); // optional: to store transfer target, comments, etc

    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable('transactions');
}

