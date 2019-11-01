//----------------------------------------------------------------------------------------------------------------------
// Google+ Authentication Support
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const passport = require('passport');
const GoogleStrategy = require('passport-google-web');
require('./serialization');

// Managers
const accountMan = require('../api/managers/account');
const configMan = require('../api/managers/config');

const { NotFound } = require('../api/errors');

const logging = require('trivial-logging');
const logger = logging.loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

const ADMINS = _.compact(_.map(_.get(process.env, 'ADMINS', '').split(','), _.trim));

if(ADMINS.length > 0)
{
    logger.warn('The following accounts will be granted super user permissions on login:', ADMINS);
} // end if

//----------------------------------------------------------------------------------------------------------------------

passport.use(new GoogleStrategy((token, profile, done) =>
{
    /* eslint-disable camelcase */

    const isAdminOverride = _.includes(ADMINS, profile.email);
    const accountDef = {
        google_id: profile.id,
        avatar: `${ profile.picture }?sz=512`,
        email: profile.email,
        full_name: profile.givenName,
        permissions: isAdminOverride ? [ '*/*' ] : []
    };

    /* eslint-enable camelcase */

    return accountMan.getAccount(accountDef)
        .then((account) =>
        {
            accountDef.permissions = _.uniq(_.concat(account.permissions, accountDef.permissions));
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
        .catch((error) =>
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

