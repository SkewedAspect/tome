//----------------------------------------------------------------------------------------------------------------------
// Google+ Authentication Support
//
// @module google-plus.js
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const passport = require('passport');
const GoogleStrategy = require('passport-google-web');
const serialization = require('./serialization');

// Managers
const accountMan = require('../managers/account');
const configMan = require('../managers/config');

const logging = require('trivial-logging');
const logger = logging.loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

passport.use(new GoogleStrategy((token, profile, done) =>
    {
        return accountMan.getAccountByGoogleID(profile.id)
            .then((account) =>
            {
                if(account)
                {
                    return account;
                }
                else
                {
                    if(configMan.get('allowRegistration', true))
                    {
                        return accountMan.createAccount({
                                google_id: profile.id,
                                avatar: profile.picture,
                                email: profile.email,
                                username: profile.name,
                                full_name: profile.givenName
                            });
                    }
                    else
                    {
                        throw new Error('User not found.');
                    } // end if
                } // end if
            })
            .then((account) =>
            {
                done(null, account);
            })
            .catch(function(error)
            {
                logger.error(`Encountered error during authentication:\n${ error.stack }`, error);
                done(error);
            });
    }));

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    initialize(app)
    {
        // Authenticate
        app.post('/auth/google', passport.authenticate('google-signin'), (req, resp) =>
            {
                resp.json(req.user);
            });

        // Logout endpoint
        app.post('/auth/logout', (req, res) =>
        {
            req.logout();
            res.end();
        });
    }
}; // end exports

//----------------------------------------------------------------------------------------------------------------------

