//----------------------------------------------------------------------------------------------------------------------
// Main server module for Tome.
//
// @module server.js
//----------------------------------------------------------------------------------------------------------------------

// Config
const { config } = require('./server/managers/config');

// Logging
const logging = require('trivial-logging');

logging.init(config);
logging.setRootLogger('tome server');
const logger = logging.loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const passport = require('passport');

// Managers
const dbMan  = require('./server/database');

// Auth
const GoogleAuth = require('./server/auth/google');

// Routes
const accountsRoute = require('./server/routes/accounts');
const wikiRoute = require('./server/routes/wiki');
const routeUtils = require('./server/routes/utils');

//----------------------------------------------------------------------------------------------------------------------

let server;

//----------------------------------------------------------------------------------------------------------------------

// Build the express app
const app = express();

// Basic request logging
app.use(routeUtils.requestLogger(logger));

// Basic error logging
app.use(routeUtils.errorLogger(logger));

// Session support
app.use(cookieParser());
app.use(bodyParser.json());

// Let the database get setup first
const loading = dbMan.getDB()
    .then((db) =>
    {
        const store = new KnexSessionStore({
            sidfieldname: config.key || 'sid',
            knex: db,
            createTable: true
        });

        app.use(session({
            secret: config.secret || 'nosecret',
            key: config.key || 'sid',
            resave: false,
            store,

            // maxAge = 7 days
            cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, secure: !config.debug },
            saveUninitialized: false
        }));

        // Passport support
        app.use(passport.initialize());
        app.use(passport.session());

        GoogleAuth.initialize(app);

        // Auth override
        if(config.overrideAuth)
        {
            // Middleware to skip authentication, for unit testing. We only allow this if we're in debug mode /and/ we've set
            // the user on `app`, something that can't be done externally.
            app.use((req, resp, next) => {
                const user = app.get('user');
                req.user = _.isUndefined(user) ? req.user : user;
                next();
            });
        } // end if

        // Setup static serving
        app.use(express.static(path.resolve('./dist')));

        // Set up our application routes
        app.use('/account', accountsRoute);
        app.use('/wiki', wikiRoute);

        // Serve index.html for any html requests, but 404 everything else.
        app.get('*', (request, response) => {
            response.format({
                html: routeUtils.serveIndex,
                json: (request, response) => {
                    response.status(404)
                        .json({
                            name: "NotFoundError",
                            message: `Requested url '${ request.url }' not found`,
                            code: "ERR_NOT_FOUND"
                        });
                }
            })
        });
    });

//----------------------------------------------------------------------------------------------------------------------

function listen()
{
    if(!server)
    {
        // Start the server
        server = app.listen(config.http.port, () =>
        {
            const host = server.address().address;
            const port = server.address().port;

            logger.info('Tome v%s listening at http://%s:%s', require('./package').version, host, port);
        });
    } // end if

    return server;
} // end listen

//----------------------------------------------------------------------------------------------------------------------

module.exports = { app, loading, listen };

//----------------------------------------------------------------------------------------------------------------------
