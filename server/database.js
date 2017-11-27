//----------------------------------------------------------------------------------------------------------------------
// DatabaseManager
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const knex = require('knex');

const appMan = require('./managers/app');
const configMan = require('./managers/config');

const logger = require('trivial-logging').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

class DatabaseManager
{
    constructor()
    {
        // Set to true to use the testing database
        this._testing = false;

        this.dbConfig = _.defaults({
            client: 'sqlite3',
            connection: {
                filename: './server/db/tome.db'
            },
            useNullAsDefault: true
        }, configMan.get('database'));

        if(this.dbConfig.client === 'sqlite3')
        {
            this.dbConfig.connection.filename = appMan.getRootPath(this.dbConfig.connection.filename);
        } // end if

        // Setup the database
        this.db = knex(this.dbConfig);

        // Check to see if we need to initialize the db
        this.loading = this._setupDB(this.db);
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Properties
    //------------------------------------------------------------------------------------------------------------------

    get testing(){ return this._testing; }
    set testing(val)
    {
        if(val)
        {
            this.loading = this._getTestDB();
            this._testing = true;
        } // end if
    }

    //------------------------------------------------------------------------------------------------------------------
    // Utils
    //------------------------------------------------------------------------------------------------------------------

    _setupDB(db, options = {})
    {
        return db('page')
            .select()
            .limit(1)
            .then(() =>
            {
                logger.info('Running any needed migrations...');

                return db.migrate.latest(options.migrate)
                    .then(() =>
                    {
                        logger.info('Migrations complete.');
                        return db;
                    });
            })
            .catch({ code: 'SQLITE_ERROR' }, (error) =>
            {
                logger.warn("No existing database, creating one.");

                return db.migrate.latest(options.migrate)
                    .then(() => db.seed.run(options.seed))
                    .then(() => db);
            });
    } // end _setupDB

    _getTestDB()
    {
        this.db = knex({
            client: 'sqlite3',
            connection: {
                filename: ':memory:'
            },
            useNullAsDefault: true,

            // This is currently required by knex to prevent timeouts.
            // Reference: https://github.com/tgriesser/knex/issues/1871
            pool: {
                min: 1,
                max: 1,
                disposeTimeout: 1000 * 60 * 60 * 100, // 100 hours
                idleTimeoutMillis: 1000 * 60 * 60 * 100 // 100 hours
            }
        });

        return this.loading = this._setupDB(this.db, { seed: { directory: './tests/seeds' } });
    } // end _getTestDB

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    getDB()
    {
        return this.loading.then(() => this.db);
    } // end getDB

    getConnObj()
    {
        return this.dbConfig;
    } // end getConnObj
} // end DatabaseManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new DatabaseManager();

//----------------------------------------------------------------------------------------------------------------------
