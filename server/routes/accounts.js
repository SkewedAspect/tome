//----------------------------------------------------------------------------------------------------------------------
// Account REST API
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const express = require('express');

const { ensureAuthenticated, promisify } = require('./utils');

// Managers
const accountMan = require('../api/managers/account');
const permsMan = require('../api/managers/permissions');

const { NotFoundError } = require('../api/errors');

//----------------------------------------------------------------------------------------------------------------------

const router = express.Router();

//----------------------------------------------------------------------------------------------------------------------

router.get('/', ensureAuthenticated, promisify((req) =>
{
    const accountAdmin = permsMan.hasPerm(req.user, 'Accounts/addAccount');
    return accountMan.getAllAccounts()
        .map((account) =>
        {
            return accountAdmin ? account : _.omit(account, 'settings', 'permissions', 'google_id');
        });
}));

router.post('/', ensureAuthenticated, promisify((req, resp) =>
{
    const accountAdmin = permsMan.hasPerm(req.user, 'Accounts/addAccount');
    if(accountAdmin)
    {
        // We never allow you to pick your id.
        const newAccount = _.omit(req.body, 'account_id');
        return accountMan.createAccount(newAccount)
            .catch({ code: 'SQLITE_CONSTRAINT' }, () =>
            {
                resp.status(409).json({
                    name: 'Duplicate Account',
                    code: 'ERR_DUPLICATE',
                    message: "One or more of this account's properties duplicate an existing account's."
                });
            });
    }
    else
    {
        resp.status(403).json({
            name: 'Permission Denied',
            code: 'ERR_PERMISSION',
            message: `User '${ req.user.username }' does not have required permission.`
        });
    } // end if
}));

router.get('/:accountID', promisify((req, resp) =>
{
    const sameAccount = `${ req.params.accountID }` === `${ _.get(req, 'user.account_id') }`;
    const accountAdmin = permsMan.hasPerm(req.user || {}, 'Accounts/addAccount');
    return accountMan.getAccountByID(req.params.accountID)
        .then((account) =>
        {
            return (accountAdmin || sameAccount) ? account : _.omit(account, 'settings', 'permissions', 'google_id');
        })
        .catch({ code: 'ERR_NOT_FOUND' }, () =>
        {
            resp.status(404).json({
                name: 'Account not found',
                code: 'ERR_NOT_FOUND',
                message: `Account with id '${ req.params.accountID }' not found.`
            });
        });
}));

router.patch('/:accountID', ensureAuthenticated, promisify((req, resp) =>
{
    const sameAccount = `${ req.params.accountID }` === `${ req.user.account_id }`;
    const accountAdmin = permsMan.hasPerm(req.user, 'Accounts/changePerms');

    if(accountAdmin || sameAccount)
    {
        // Copy the update
        let newAccount = _.cloneDeep(req.body);

        // Set the account id to be the one in the request parameter.
        // eslint-disable-next-line camelcase
        newAccount.account_id = req.params.accountID;

        // If we're not an account admin, we don't allow changes to permissions.
        if(!accountAdmin)
        {
            newAccount = _.omit(newAccount, 'permissions', 'groups');

            // We also only allow setting of google_id, not changes.
            if(!!req.user.google_id || req.user.google_id === 0)
            {
                newAccount = _.omit(newAccount, 'google_id');
            } // end if
        } // end if

        // Merge settings
        newAccount.settings = _.merge(req.user.settings, newAccount.settings);

        // Update the account
        return accountMan.updateAccount(newAccount)
            .tap((user) => _.assign(req.user, user));
    }
    else
    {
        resp.status(403).json({
            name: 'Permission Denied',
            code: 'ERR_PERMISSION',
            message: `User '${ req.user.username }' does not have required permission.`
        });
    } // end if
}));

router.delete('/:accountID', ensureAuthenticated, promisify((req, resp) =>
{
    const accountAdmin = permsMan.hasPerm(req.user, 'Accounts/delAccount');
    if(accountAdmin)
    {
        return accountMan
            .deleteAccount(req.params.accountID)
            .then((rows) =>
            {
                if(rows === 0)
                {
                    throw new NotFoundError(`Account with id '${ req.params.accountID }' not found.`);
                } // end if
            })
            .catch({ code: 'ERR_NOT_FOUND' }, (error) =>
            {
                resp.status(404).json({
                    name: error.name,
                    code: 'ERR_NOT_FOUND',
                    message: error.message
                });
            });
    }
    else
    {
        resp.status(403).json({
            name: 'Permission Denied',
            code: 'ERR_PERMISSION',
            message: `User '${ req.user.username }' does not have required permission.`
        });
    } // end if
}));

//----------------------------------------------------------------------------------------------------------------------

module.exports = router;

//----------------------------------------------------------------------------------------------------------------------
