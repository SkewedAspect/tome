//----------------------------------------------------------------------------------------------------------------------
// tomev1ToSQLite - Brief description for tomev1ToSQLite module.
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const Promise = require('bluebird');
const path = require('path');
const knex = require('knex');
const moment = require('moment');

const program = require('commander');

//----------------------------------------------------------------------------------------------------------------------

function migrateDB(db, users, pages, revisions)
{
    console.log('Begining migration...');

    return Promise.all([
            db('account').truncate(),
            db('page').truncate(),
            db('revision').truncate()
        ])
        .then(() =>
        {
            console.log(`Processing accounts(${ users.length })...`);

            return Promise.map(users, (user) =>
            {
                return db('account').insert({
                    username: (user.nickname || user.email.split('@')[0]).toLowerCase(),
                    email: user.email,
                    full_name: user.displayName,
                    google_id: user.gPlusID,
                    avatar: user.avatar
                });
            });
        })
        .then(() =>
        {
            console.log(`Processing pages(${ pages.length })...`);

            return Promise.map(pages, (page) =>
            {
                if(page.url === 'welcome')
                {
                    page.url = '';
                } // end if

                const revision = _.find(revisions, { id: page.revisionID });
                return db('page').insert({
                        path: `/${ page.url }`,
                        title: revision.title
                    })
                    .then(([ pageID ]) =>
                    {
                        pageMap[page.id] = pageID;
                    });
            });
        })
        .then(() =>
        {
            console.log(`Processing revisions(${ revisions.length })...`);

            return Promise.map(revisions, (revision) =>
            {
                return db('revision').insert({
                        page_id: pageMap[revision.pageID],
                        content: revision.body,
                        edited: db.raw("datetime(?, 'unixepoch')", [revision.edited])
                    });
            });
        })
        .then(() =>
        {
            console.log('Done.');
            process.exit(0);
        });
} // end migrateDB

//----------------------------------------------------------------------------------------------------------------------

let oldDBPath;
const pageMap = {};

//----------------------------------------------------------------------------------------------------------------------

program
    .version('0.1.0')
    .arguments('<dbPath>')
    .action((dbPath) =>
    {
        oldDBPath = dbPath;
    })
    .parse(process.argv);

//----------------------------------------------------------------------------------------------------------------------

if(oldDBPath)
{
    let users = [];
    let pages = [];
    let revisions = [];

    try
    {
        users = _.values(require(path.resolve(path.join(oldDBPath, 'users.json'))));
        pages = _.values(require(path.resolve(path.join(oldDBPath, 'pages.json'))));
        revisions = _.values(require(path.resolve(path.join(oldDBPath, 'revisions.json'))));
    }
    catch(error)
    {
        console.error('Error: <dbPath> is not valid:', error.message);
    } // end catch

    // Fake dates on the revisions
    _.each(pages, (page) =>
    {
        const allRevs = _.filter(revisions, { pageID: page.id });
        const endDate = moment(page.updated);
        const startDate = moment(page.created || endDate.clone().subtract(allRevs.length, 'days'));

        const dates = [startDate];
        if(allRevs.length > 1)
        {
            const divisions = allRevs.length - 1;
            const inc = (endDate - startDate) / divisions;

            _.each(_.range(divisions), (idx) =>
            {
                dates.push(startDate.clone().add(inc * (idx + 1)));
            });
        } // end if

        _.each(allRevs, (rev, idx) =>
        {
            rev.edited = dates[idx].unix();
        });
    });

    const db = knex({
        client: 'sqlite3',
        connection: {
            //TODO: We need to allow the db to setup to be specified... eventually.
            filename: './server/db/tome.sqlite'
        },
        useNullAsDefault: true
    });

    return migrateDB(db, users, pages, revisions);
}
else
{
    console.log('<dbPath> is required.');
    program.outputHelp();
    process.exit(1);
} // end if

//----------------------------------------------------------------------------------------------------------------------
