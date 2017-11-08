//----------------------------------------------------------------------------------------------------------------------
// Initial Setup Migration
//----------------------------------------------------------------------------------------------------------------------

exports.up = function(knex, Promise)
{
    return Promise.all([

        // The `account` table
        knex.schema.createTable('account', (table) =>
        {
            table.increments('account_id').primary();
            table.string('username').notNullable().index();
            table.text('email').notNullable().index();
            table.text('full_name');
            table.text('avatar');
            table.string('google_id').index();
            table.timestamp('created').defaultTo(knex.fn.now());
        }),

        // The `page` table
        knex.schema.createTable('page', (table) =>
        {
            table.increments('page_id').primary();
            table.text('path').notNullable().unique().index();
            table.text('title').notNullable();
        }),

        // The `revision` table
        knex.schema.createTable('revision', (table) =>
        {
            table.increments('revision_id').primary();
            table.text('content');
            table.integer('page_id').references('page.page_id').notNullable();
            table.timestamp('edited').notNullable().defaultTo(knex.fn.now());
        }),

        // The `comment` table
        knex.schema.createTable('comment', (table) =>
        {
            table.increments('comment_id').primary();
            table.text('title').notNullable();
            table.text('content');
            table.integer('page_id').references('page.page_id').notNullable();
            table.integer('account_id').references('account.account_id').notNullable();
            table.timestamp('created').defaultTo(knex.fn.now());
            table.timestamp('edited').defaultTo(knex.fn.now());
        }),

        // Setup the `current_revisions` view...
        knex.raw(`CREATE VIEW current_revision (path, title, content, created, edited) AS 
            SELECT p.path, p.title, r.content, curr.created, r.edited 
                FROM (
                    SELECT page_id, MAX(edited) AS edited, min(edited) AS created 
                        FROM revision GROUP BY page_id
                ) AS curr 
                NATURAL JOIN page AS p 
                NATURAL JOIN revision AS r
                ORDER BY p.path`
        )
    ]);
}; // end exports.up

//----------------------------------------------------------------------------------------------------------------------

exports.down = function(knex, Promise)
{
  return Promise.all([
      knex.schema.dropTable('account'),
      knex.schema.dropTable('page'),
      knex.schema.dropTable('revision'),
      knex.schema.dropTable('comments'),

      // Drop the `current_revisions` view...
      knex.raw('drop view if exists current_revision')
  ]);
}; // end exports.down

//----------------------------------------------------------------------------------------------------------------------
