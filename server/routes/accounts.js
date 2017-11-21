//----------------------------------------------------------------------------------------------------------------------
// Account REST API
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const express = require('express');

const { ensureAuthenticated, promisify } = require('./utils');

// Managers
const accountMan = require('../managers/account');
const permsMan = require('../managers/permissions');

//----------------------------------------------------------------------------------------------------------------------

const router = express.Router();

//----------------------------------------------------------------------------------------------------------------------

router.get('/', ensureAuthenticated, promisify((req, resp) =>
{
    return accountMan.getAllAccounts();
}));

router.post('/', ensureAuthenticated, promisify((req, resp) =>
{
    const accountAdmin = permsMan.hasPerm(req.user, 'Accounts/addAccount');
    if(accountAdmin)
    {
        // We never allow you to pick your id.
        let newAccount = _.omit(req.body, 'account_id');
        return accountMan.createAccount(newAccount);
    }
    else
    {
        resp.status(403).json({
            name: 'Permission Denied',
            message: `User '${ req.user.email }' does not have required permission.`
        });
    } // end if
}));

router.get('/:accountID', promisify((req, resp) =>
{
    return accountMan.getAccountByID(req.params.accountID)
        .then((account) =>
        {
            if(!req.isAuthenticated())
            {
                return _.omit(account, 'settings', 'permissions', 'google_id');
            } // end if
        });
}));

router.put('/:accountID', ensureAuthenticated, promisify((req, resp) =>
{
    const sameAccount = req.params.accountID !== req.user.account_id;
    const accountAdmin = permsMan.hasPerm(req.user, 'Accounts/changePerms');

    if(accountAdmin || sameAccount)
    {
        // We never allow changes to id.
        let newAccount = _.omit(req.body, 'account_id');

        // If we're not an account admin, we don't allow changes to permissions.
        if(!accountAdmin)
        {
            newAccount = _.omit(newAccount, 'permissions', 'groups');

            // We also only allow setting of google_id, not changes.
            if(!_.isUndefined(req.user.google_id))
            {
                newAccount = _.omit(newAccount, 'google_id');
            } // end if
        } // end if

        // Merge settings
        newAccount.settings = _.merge(req.user.settings);

        // Set the account id to be the one in the request parameter.
        newAccount.account_id = req.params.accountID;

        // Update the account
        return accountMan.updateAccount(newAccount);
    }
    else
    {
        resp.status(403).json({
            name: 'Permission Denied',
            message: `User '${ req.user.email }' does not have required permission.`
        });
    } // end if
}));

router.get('/:accountID', ensureAuthenticated, promisify((req, resp) =>
{
    const accountAdmin = permsMan.hasPerm(req.user, 'Accounts/delAccount');
    if(accountAdmin)
    {
        return accountMan.deleteAccount(req.params.accountID);
    }
    else
    {
        resp.status(403).json({
            name: 'Permission Denied',
            message: `User '${ req.user.email }' does not have required permission.`
        });
    } // end if
}));

//----------------------------------------------------------------------------------------------------------------------

module.exports = router;

//----------------------------------------------------------------------------------------------------------------------
