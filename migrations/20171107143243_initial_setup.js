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
            table.string('username').notNullable().unique().index();
            table.text('email').notNullable().unique().index();
            table.text('full_name');
            table.text('avatar');
            table.string('google_id').unique().index();
            table.specificType('permissions', 'JSON').notNullable().defaultTo("[]");
            table.specificType('settings', 'JSON').notNullable().defaultTo("{}");
            table.timestamp('created').defaultTo(knex.fn.now());
        }),

        // The `role` table
        knex.schema.createTable('role', (table) =>
        {
            table.increments('role_id').primary();
            table.text('name').notNullable().unique();
            table.specificType('permissions', 'JSON').notNullable().defaultTo("[]");
        }),

        // The `account_role` table
        knex.schema.createTable('account_role', (table) =>
        {
            table.integer('account_id').references('account.account_id').notNullable();
            table.integer('role_id').references('role.role_id').notNullable();
            table.unique(['account_id', 'role_id']);
        }),

        // The `page` table
        knex.schema.createTable('page', (table) =>
        {
            table.increments('page_id').primary();
            table.text('path').notNullable().unique().index();
            table.text('title').notNullable();
            table.string('action_view').notNullable().defaultTo('inherit');
            table.string('action_modify').notNullable().defaultTo('inherit');
        }),

        // The `revision` table
        knex.schema.createTable('revision', (table) =>
        {
            table.increments('revision_id').primary();
            table.text('body');
            table.integer('page_id').notNullable().references('page.page_id').onDelete('CASCADE');
            table.timestamp('edited').notNullable().defaultTo(knex.fn.now());
        }),

        // The `comment` table
        knex.schema.createTable('comment', (table) =>
        {
            table.increments('comment_id').primary();
            table.text('title').notNullable();
            table.text('body');
            table.integer('page_id').notNullable().references('page.page_id').onDelete('CASCADE');
            table.integer('account_id').notNullable().references('account.account_id');
            table.timestamp('created').notNullable().defaultTo(knex.fn.now());
            table.timestamp('edited').notNullable().defaultTo(knex.fn.now());
        }),

        // Setup the `current_revisions` view...
        knex.raw(`CREATE VIEW current_revision (page_id, path, title, body, created, edited, revision_id, action_view, action_modify) AS 
            SELECT p.page_id, p.path, p.title, r.body, curr.created, r.edited, r.revision_id, p.action_view, p.action_modify 
                FROM (
                    SELECT page_id, MAX(edited) AS edited, min(edited) AS created, MAX(revision_id) as revision_id 
                        FROM revision GROUP BY page_id
                ) AS curr 
                NATURAL JOIN page AS p 
                NATURAL JOIN revision AS r
                ORDER BY p.path`
        ),

        // Setup FTS on pages
        knex.raw(`CREATE VIRTUAL TABLE page_search 
            USING FTS5(
                title, 
                body, 
                content = 'current_revision', 
                content_rowid = page_id, 
                tokenize = 'porter unicode61 remove_diacritics 1'
            );`
        ),

    ])
    .then(() =>
    {
        // Setup Trigger for tables
        return Promise.all([
            // `page` FTS triggers
            knex.raw(`CREATE TRIGGER page_ai AFTER INSERT ON page BEGIN
                    INSERT INTO page_search(rowid, title) VALUES (new.page_id, new.title);
                END;`
            ),

            knex.raw(`CREATE TRIGGER page_ad AFTER DELETE ON page BEGIN
                    INSERT INTO page_search(page_search, rowid, title) VALUES('delete', old.page_id, old.title);
                END;`
            ),

            knex.raw(`CREATE TRIGGER page_au AFTER UPDATE ON page BEGIN
                    INSERT INTO page_search(page_search, rowid, title) VALUES('delete', old.page_id, old.title);
                    INSERT INTO page_search(rowid, title) VALUES (new.page_id, new.title);
                END;`
            ),

            // `revision` FTS triggers
            knex.raw(`CREATE TRIGGER revision_ai AFTER INSERT ON revision BEGIN
                    INSERT INTO page_search(rowid, body) VALUES (new.page_id, new.body);
                END;`
            ),

            knex.raw(`CREATE TRIGGER revision_ad AFTER DELETE ON revision BEGIN
                    INSERT INTO page_search(page_search, rowid, body) VALUES('delete', old.page_id, old.body);
                END;`
            ),

            knex.raw(`CREATE TRIGGER revision_au AFTER UPDATE ON revision BEGIN
                    INSERT INTO page_search(page_search, rowid, body) VALUES('delete', old.page_id, old.body);
                    INSERT INTO page_search(rowid, body) VALUES (new.page_id, new.body);
                END;`
            )
        ])
    });
}; // end exports.up

//----------------------------------------------------------------------------------------------------------------------

exports.down = function(knex, Promise)
{
  return Promise.all([
      knex.schema.dropTable('account'),
      knex.schema.dropTable('role'),
      knex.schema.dropTable('account_role'),
      knex.schema.dropTable('page'),
      knex.schema.dropTable('revision'),
      knex.schema.dropTable('comments'),

      // Drop FTS Tables
      knex.schema.dropTable('page_search'),

      // Drop the `current_revisions` view...
      knex.raw('drop view if exists current_revision')
  ]);
}; // end exports.down

//----------------------------------------------------------------------------------------------------------------------
