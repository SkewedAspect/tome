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

const { NotFound } = require('../errors');

const logging = require('trivial-logging');
const logger = logging.loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

passport.use(new GoogleStrategy((token, profile, done) =>
    {
        const accountDef = {
            google_id: profile.id,
            avatar: profile.picture,
            email: profile.email,
            full_name: profile.givenName
        };

        return accountMan.getAccount(accountDef)
            .then((account) =>
            {
                return accountMan.updateAccount(_.merge(account, accountDef));
            })
            .catch({ code: 'ERR_NOT_FOUND' }, () =>
            {
                if(configMan.get('allowRegistration', true))
                {
                    accountDef.username = accountDef.email.split('@')[0];
                    return accountMan.createAccount(accountDef);
                }
                else
                {
                    throw new NotFound('User not found.');
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

