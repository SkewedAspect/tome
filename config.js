//----------------------------------------------------------------------------------------------------------------------
// Configuration for Tome
//
// @module
//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    debug: true,
    debugStream: true,
    secret: process.env.SESSION_SECRET || "copula ## main beat pen 21 jjg226dh",
    key: "tome-session",
    google: {
        clientID: "353888173268-4luhg23ai0i6rskck2pjcs4bdssnhshk.apps.googleusercontent.com",
        clientSecret: "ZsjeJtlyB2H3XxUvD4V2JW4Q"
    },
    http: {
        domain: process.env.WEB_DOMAIN || 'http://localhost:4000',
        port: process.env.SERVER_PORT || 4321
    },
    rethink: {
        host: process.env.RETHINK_DB_HOST || 'localhost',
        port: process.env.RETHINK_DB_PORT || 28015,
        db: 'tome'
    },
    logging: {
        streams: [
            {
                stream: process.stdout,
                level: "info"
            }
        ]
    }
}; // end exports

//----------------------------------------------------------------------------------------------------------------------
