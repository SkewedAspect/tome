//----------------------------------------------------------------------------------------------------------------------
// tomev1ToSQLite - Brief description for tomev1ToSQLite module.
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const Promise = require('bluebird');
const path = require('path');
const knex = require('knex');
const moment = require('moment');

const program = require('commander');

//----------------------------------------------------------------------------------------------------------------------

const pageMap = {};
const accountMap = {};

//----------------------------------------------------------------------------------------------------------------------

function migrateDB(db, users, pages, revisions, comments)
{
    console.log('Beginning migration...');

    return Promise.all([
            db('account').truncate(),
            db('page').truncate(),
            db('revision').truncate(),
            db('comment').truncate()
        ])
        .then(() =>
        {
            console.log(`Processing accounts(${ users.length })...`);

            return Promise.map(users, (user) =>
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
            });
        })
        .then(() =>
        {
            console.log(`Processing pages(${ pages.length })...`);

            return Promise.map(pages, (page) =>
            {
                //TODO: Read this from the site's config.
                if(page.url === 'welcome')
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
            });
        })
        .then(() =>
        {
            console.log(`Processing revisions(${ revisions.length })...`);

            return Promise.map(revisions, (revision) =>
            {
                return db('revision').insert({
                        page_id: pageMap[revision.pageID],
                        body: revision.body,
                        edited: db.raw("datetime(?, 'unixepoch')", [revision.edited])
                    });
            });
        })
        .then(() =>
        {
            console.log(`Processing comments(${ comments.length })...`);

            return Promise.map(comments, (comment) =>
            {
                const createdTS = (new Date(comment.created)).getTime();
                const editedTS = (new Date(comment.updated)).getTime();

                return db('comment')
                    .insert({
                        account_id: accountMap[comment.userID],
                        page_id: pageMap[comment.pageID],
                        title: comment.title,
                        body: comment.body,
                        created: db.raw("datetime(?, 'unixepoch')", [createdTS]),
                        edited: db.raw("datetime(?, 'unixepoch')", [editedTS])
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
    let comments = [];

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

    // There might not be a comments db
    try { comments = _.values(require(path.resolve(path.join(oldDBPath, 'comments.json')))); } catch(_){}

    // Fake dates on the revisions
    _.each(pages, (page) =>
    {
        const allRevs = _.filter(revisions, { pageID: page.id });
        const endDate = moment(new Date(page.updated));
        const startDate = moment(new Date(page.created || endDate.clone().subtract(allRevs.length, 'days')));

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
            rev.edited = rev.created ? (new Date(rev.created).getTime() / 1000) : dates[idx].unix();
        });
    });

    const db = knex({
        client: 'sqlite3',
        connection: {
            filename: './db/tome.db'
        },
        useNullAsDefault: true
    });

    return migrateDB(db, users, pages, revisions, comments);
}
else
{
    console.error('<dbPath> is required.');
    program.outputHelp();
    process.exit(1);
} // end if

//----------------------------------------------------------------------------------------------------------------------
