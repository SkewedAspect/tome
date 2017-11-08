//----------------------------------------------------------------------------------------------------------------------
// DatabaseManager
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const path = require('path');
const knex = require('knex');

//----------------------------------------------------------------------------------------------------------------------

class DatabaseManager
{
    constructor()
    {
        //TODO: Eventually, we need to get this from the config.
        this.dbName = 'tome.sqlite';

        //TODO: Eventually, we need to detect the correct path for the database file.
        this.dbPath = './server/db';

        this.connObj = {
            client: 'sqlite3',
            connection: {
                filename: path.join(this.dbPath, this.dbName)
            },
            useNullAsDefault: true
        };

        // Setup the database
        this.db = knex(this.connObj);
    } // end constructor

    getDB()
    {
        return this.db;
    } // end getDB

    getConnObj()
    {
        return this.connObj;
    } // end getConnObj

    getDBPath()
    {
        return this.connObj.connection.filename;
    } // end getDBPath
} // end DatabaseManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new DatabaseManager();

//----------------------------------------------------------------------------------------------------------------------
