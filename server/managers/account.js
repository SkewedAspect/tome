//----------------------------------------------------------------------------------------------------------------------
// AccountManager
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const accountRE = require('../rules-engines/account');
const accountRA = require('../resource-access/accounts');

const { NotFoundError } = require('../errors');

//----------------------------------------------------------------------------------------------------------------------

class AccountManager
{
    getAllAccounts()
    {
        return accountRA.getAccounts();
    } // end getAllAccounts

    getAccountByID(accountID)
    {
        return accountRE.validateGetAccountBy('account_id', accountID)
            .then(() => accountRA.$getAccount({ account_id: accountID }))
            .catch((error) =>
            {
                console.log('??!!!!');
                throw new NotFoundError(`Account not found for id '${ accountID }'.`);
            });
    } // getAccountByID

    getAccountByGoogleID(googleID)
    {
        return accountRE.validateGetAccountBy('google_id', googleID)
            .then(() => accountRA.$getAccount({ google_id: googleID }));
    } // getAccountByGoogleID

    getAccountByEmail(email)
    {
        return accountRE.validateGetAccountBy('email', email)
            .then(() => accountRA.$getAccount({ email }));
    } // getAccountByEmail

    createAccount(account)
    {
        return accountRE.validateCreate(account)
            .then(() => accountRA.addAccount(account))
            .then(({ id }) => this.getAccountByID(id));
    } // end createAccount

    updateAccount(account)
    {
        return accountRE.validateUpdate(account)
            .then(() => accountRA.updateAccount(account));
    } // end updateAccount

    deleteAccount(accountID)
    {
        return accountRE.validateDelete(accountID)
            .then(() => accountRA.deleteAccount(accountID));
    } // end deleteAccount
} // end AccountManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new AccountManager();

//----------------------------------------------------------------------------------------------------------------------
