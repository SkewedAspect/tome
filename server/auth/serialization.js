//----------------------------------------------------------------------------------------------------------------------
// Handles user serialization/deserialization
//----------------------------------------------------------------------------------------------------------------------

const passport = require('passport');

// Managers
const accountMan = require('../api/managers/account');

//----------------------------------------------------------------------------------------------------------------------

passport.serializeUser((account, done) =>
{
    done(null, account.account_id);
});

passport.deserializeUser((accountID, done) =>
{
    accountMan.getAccountByID(accountID)
        .then((account) => done(null, account))
        .catch((error) => done(error));
});

//----------------------------------------------------------------------------------------------------------------------
