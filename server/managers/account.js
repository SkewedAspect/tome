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

    getAccountByID(account_id)
    {
        return accountRE.validateGetAccountBy('account_id', account_id)
            .then(() => accountRA.$getAccount({ account_id }))
            .catch((error) =>
            {
                console.log('??!!!!');
                throw new NotFoundError(`Account not found for id '${ account_id }'.`);
            });
    } // getAccountByID

    getAccountByGoogleID(google_id)
    {
        return accountRE.validateGetAccountBy('google_id', google_id)
            .then(() => accountRA.$getAccount({ google_id }));
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

    deleteAccount(account_id)
    {
        return accountRE.validateDelete(account_id)
            .then(() => accountRA.deleteAccount(account_id));
    } // end deleteAccount
} // end AccountManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new AccountManager();

//----------------------------------------------------------------------------------------------------------------------
