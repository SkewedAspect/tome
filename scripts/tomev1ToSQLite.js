//----------------------------------------------------------------------------------------------------------------------
// Convert from Tome v1 to Tome v2
//----------------------------------------------------------------------------------------------------------------------

/* eslint-disable camelcase */

const _ = require('lodash');
const path = require('path');
const moment = require('moment');
const program = require('commander');

// Managers
const dbMan = require('../server/database');

//----------------------------------------------------------------------------------------------------------------------

let oldDBPath;
const pageMap = {};
const accountMap = {};

//----------------------------------------------------------------------------------------------------------------------

async function migrateDB(db, users, pages, revisions, comments, config)
{
    console.log('Clearing out database...');

    //------------------------------------------------------------------------------------------------------------------

    await db('account').truncate();
    await db('page').truncate();
    await db('revision').truncate();
    await db('comment').truncate();

    //------------------------------------------------------------------------------------------------------------------

    console.log(`Processing accounts(${ users.length })...`);

    //------------------------------------------------------------------------------------------------------------------

    await Promise.all(users.map((user) =>
    {
        return db('account')
            .insert({
                username: (user.nickname || user.email.split('@')[0]).toLowerCase(),
                email: user.email,
                full_name: user.displayName,
                google_id: user.gPlusID,
                avatar: user.avatar
            })
            .then(([ accountID ]) =>
            {
                accountMap[user.email] = accountID;
            });
    }));

    //------------------------------------------------------------------------------------------------------------------

    console.log(`Processing pages(${ pages.length })...`);

    //------------------------------------------------------------------------------------------------------------------

    await Promise.all(pages.map((page) =>
    {
        const welcomeURL = config.frontPage.substr(1);
        if(page.url === welcomeURL)
        {
            page.url = '';
        } // end if

        const revision = _.find(revisions, { id: page.revisionID });

        const pageObj = {
            path: `/${ page.url }`,
            title: revision.title
        };

        if(pageObj.path === '/')
        {
            pageObj.action_view = '*';
            pageObj.action_modify = '*';
        }
        else if(page.private)
        {
            pageObj.action_view = 'private';
            pageObj.action_modify = 'private';
        } // end if

        return db('page')
            .insert(pageObj)
            .then(([ pageID ]) =>
            {
                pageMap[page.id] = pageID;
            });
    }));

    //------------------------------------------------------------------------------------------------------------------

    console.log(`Processing revisions(${ revisions.length })...`);

    //------------------------------------------------------------------------------------------------------------------

    await Promise.all(revisions.map((revision) =>
    {
        return db('revision').insert({
            page_id: pageMap[revision.pageID],
            body: revision.body,
            edited: db.raw("datetime(?, 'unixepoch')", [ revision.edited ])
        });
    }));

    //------------------------------------------------------------------------------------------------------------------

    console.log(`Processing comments(${ comments.length })...`);

    //------------------------------------------------------------------------------------------------------------------

    await Promise.all(comments.map((comment) =>
    {
        const createdTS = (new Date(comment.created)).getTime();
        const editedTS = (new Date(comment.updated)).getTime();

        return db('comment')
            .insert({
                account_id: accountMap[comment.userID],
                page_id: pageMap[comment.pageID],
                title: comment.title,
                body: comment.body,
                created: db.raw("datetime(?, 'unixepoch')", [ createdTS / 1000 ]),
                edited: db.raw("datetime(?, 'unixepoch')", [ editedTS / 1000 ])
            });
    }));
} // end migrateDB

function loadOldDBFile(dbPath)
{
    try
    {
        return require(path.resolve(path.join(oldDBPath, dbPath)));
    }
    catch (_)
    {
        console.warn(`Failed to load '${ dbPath }'. Returning empty object.`);
        return {};
    } // end try/catch
} // end loadOldDBFile

//----------------------------------------------------------------------------------------------------------------------

async function main()
{
    if(oldDBPath)
    {
        console.log('Preparing...');

        const users = Object.values(loadOldDBFile('users.json'));
        const pages = Object.values(loadOldDBFile('pages.json'));
        const revisions = Object.values(loadOldDBFile('revisions.json'));
        const comments = Object.values(loadOldDBFile('comments.json'));
        const oldConfig = loadOldDBFile('../config.js');

        // Fake dates on the revisions
        pages.forEach((page) =>
        {
            const allRevs = _.filter(revisions, { pageID: page.id });
            const endDate = moment(new Date(page.updated));
            const startDate = moment(new Date(page.created || endDate.clone().subtract(allRevs.length, 'days')));

            const dates = [ startDate ];
            if(allRevs.length > 1)
            {
                const divisions = allRevs.length - 1;
                const inc = (endDate - startDate) / divisions;

                _.each(_.range(divisions), (idx) =>
                {
                    dates.push(startDate.clone().add(inc * (idx + 1)));
                });
            } // end if

            // We have to modify the rev object directly.
            allRevs.forEach((rev, idx) =>
            {
                rev.edited = rev.created ? (new Date(rev.created).getTime() / 1000) : dates[idx].unix();
            });
        });

        console.log('Beginning migration...');

        // Get a reference to the DB, and migrate the old to the new.
        const db = await dbMan.getDB();
        return migrateDB(db, users, pages, revisions, comments, oldConfig);
    }
    else
    {
        console.error('<dbPath> is required.');
        program.outputHelp();
        process.exit(1);
    } // end if
} // end main

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

// Run the main script
main()
    .then(() =>
    {
        console.log('Done.');
        process.exit(0);
    })
    .catch((ex) =>
    {
        console.error(`Error encountered: '${ ex.stack }'.`);
        process.exit(1);
    });

//----------------------------------------------------------------------------------------------------------------------
