//----------------------------------------------------------------------------------------------------------------------
// Configuration for Tome
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const DEBUG = ((process.env.DEBUG || '').toLowerCase() === 'true') || false;
const UNIT_TESTS = ((process.env.UNIT_TESTS || '').toLowerCase() === 'true') || false;

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    debug: DEBUG,
    debugStream: DEBUG,
    overrideAuth: DEBUG,
    unitTests: UNIT_TESTS,
    secret: process.env.SESSION_SECRET || "copula ## main beat pen 21 jjg226dh",
    key: "tome_session",
    google: {
        clientID: "353888173268-4luhg23ai0i6rskck2pjcs4bdssnhshk.apps.googleusercontent.com",
        clientSecret: "ZsjeJtlyB2H3XxUvD4V2JW4Q"
    },
    http: {
        domain: process.env.WEB_DOMAIN || 'http://localhost',
        port: process.env.SERVER_PORT || 4321
    },

    // TOME Options
    allowRegistration: true,

    database:
    {
        connection: { filename: './server/db/tome.db' }
    }
}; // end exports

//----------------------------------------------------------------------------------------------------------------------
