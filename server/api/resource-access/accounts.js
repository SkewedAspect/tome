//----------------------------------------------------------------------------------------------------------------------
// AccountResourceAccess
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const dbMan = require('../../database');
const { AppError, MultipleResultsError, NotFoundError } = require('../errors');

//----------------------------------------------------------------------------------------------------------------------

/* eslint-disable camelcase */

class AccountResourceAccess
{
    constructor()
    {
        this.loading = dbMan.getDB();
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Utility Functions
    //------------------------------------------------------------------------------------------------------------------

    _parseAccount(account)
    {
        account.created = Date.parse(`${ account.created } GMT`);
        account.permissions = JSON.parse(_.get(account, 'permissions', []));
        account.settings = JSON.parse(_.get(account, 'settings', {}));

        return account;
    } // end _parseAccount

    //------------------------------------------------------------------------------------------------------------------
    // Utility Queries
    //------------------------------------------------------------------------------------------------------------------

    $getAccount(filter)
    {
        return this.loading
            .then((db) => db('account')
                .select()
                .where(filter)
                .then((accounts) =>
                {
                    if(accounts.length > 1)
                    {
                        throw new MultipleResultsError('account');
                    }
                    else if(accounts.length === 0)
                    {
                        throw new NotFoundError('No account found.');
                    }
                    else
                    {
                        return this._parseAccount(accounts[0]);
                    } // end if
                }));
    } // end $getAccount

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    getAccounts()
    {
        return this.loading
            .then((db) => db('account')
                .select()
                .map(this._parseAccount));
    } // end getAccounts

    getAccountsByUsername(username)
    {
        return this.loading
            .then((db) => db('account')
                .select()
                .where({ username })
                .map(this._parseAccount));
    } // end getAccountsByUsername

    getAccount({ account_id, google_id, email })
    {
        if(!_.isUndefined(account_id))
        {
            return this.$getAccount({ account_id })
                .then((account) =>
                {
                    if(!account)
                    {
                        // If we don't have one with this `account_id`, fall back to the other options.
                        return this.getAccount({ google_id, email });
                    }
                    else
                    {
                        return account;
                    } // end if
                });
        }
        else if(!_.isUndefined(email))
        {
            return this.$getAccount({ email })
                .then((account) =>
                {
                    if(!account)
                    {
                        // If we don't have one with this `email`, fall back to the other option.
                        return this.getAccount({ google_id });
                    }
                    else
                    {
                        return account;
                    } // end if
                });
        }
        else if(!_.isUndefined(google_id))
        {
            return this.$getAccount({ google_id });
        }
        else
        {
            throw new AppError('You may only look up an account by `account_id`, `google_id`, or `email`.');
        } // end if
    } // end getAccount

    addAccount(account)
    {
        account.permissions = JSON.stringify(_.get(account, 'permissions', []));
        account.settings = JSON.stringify(_.get(account, 'settings', {}));

        return this.loading
            .then((db) => db('account')
                .insert(account)
                .then(([ id ]) => ({ id })));
    } // end addAccount

    updateAccount(account)
    {
        const account_id = account.account_id;
        account = _.omit(account, 'account_id', 'googleID');
        account.permissions = JSON.stringify(_.get(account, 'permissions', []));
        account.settings = JSON.stringify(_.get(account, 'settings', {}));

        return this.loading
            .then((db) => db('account')
                .update(account)
                .where({ account_id }));
    } // end updateAccount

    deleteAccount(account_id)
    {
        return this.loading
            .then((db) => db('account')
                .where({ account_id })
                .delete());
    } // end deleteAccount
} // end AccountResourceAccess

//----------------------------------------------------------------------------------------------------------------------

module.exports = new AccountResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
