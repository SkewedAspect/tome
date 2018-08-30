//----------------------------------------------------------------------------------------------------------------------
// AccountManager
//----------------------------------------------------------------------------------------------------------------------

const accountRE = require('../rules-engines/account');
const accountRA = require('../resource-access/accounts');

//----------------------------------------------------------------------------------------------------------------------

class AccountManager
{
    getAllAccounts()
    {
        return accountRA.getAccounts();
    } // end getAllAccounts

    getAccount(idObj)
    {
        return accountRA.getAccount(idObj);
    } // end getAccount

    getAccountByID(accountID)
    {
        return accountRE.validateGetAccountBy('account_id', accountID)
            .then(() => accountRA.$getAccount({ account_id: accountID }));
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

    getAccountByUsername(username)
    {
        return accountRE.validateGetAccountBy('username', username)
            .then(() => accountRA.$getAccount({ username }));
    } // getAccountByUsername

    createAccount(account)
    {
        return accountRE.validateCreate(account)
            .then(() => accountRA.addAccount(account))
            .then(({ id }) => this.getAccountByID(id));
    } // end createAccount

    updateAccount(account)
    {
        return accountRE.validateUpdate(account)
            .then(() => accountRA.updateAccount(account))
            .then(() => this.getAccountByID(account.account_id));
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
