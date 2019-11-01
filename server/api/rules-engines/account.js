//----------------------------------------------------------------------------------------------------------------------
// AccountRulesEngine
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const Promise = require('bluebird');
const { ValidationError } = require('../errors');

//----------------------------------------------------------------------------------------------------------------------

/* eslint-disable camelcase */

class AccountRulesEngine
{
    validateGetAccountBy(filterName, accountFilter)
    {
        return new Promise((resolve, reject) =>
        {
            if(!_.isString(accountFilter) && !_.isFinite(accountFilter))
            {
                reject(new ValidationError(filterName, 'must be a string or number.'));
            } // end if

            // We've successfully validated
            resolve(true);
        });
    } // end validateGetAccountBy

    validateCreate(account)
    {
        return new Promise((resolve, reject) =>
        {
            if(!_.isUndefined(account.account_id))
            {
                reject(new ValidationError('account_id', 'value not allowed as part of creation payload'));
            } // end if

            if(!_.isString(account.username))
            {
                reject(new ValidationError('username', 'must be a string'));
            } // end if

            if(!_.isString(account.email))
            {
                reject(new ValidationError('email', 'must be a string'));
            } // end if

            if(!_.isUndefined(account.full_name) && !_.isString(account.full_name))
            {
                reject(new ValidationError('full_name', 'must be a string'));
            } // end if

            if(!_.isUndefined(account.avatar) && !_.isString(account.avatar))
            {
                reject(new ValidationError('avatar', 'must be a string'));
            } // end if

            if(!_.isUndefined(account.google_id) && !_.isString(account.google_id))
            {
                reject(new ValidationError('google_id', 'must be a string'));
            } // end if

            if(!_.isUndefined(account.permissions) && !_.isArray(account.permissions))
            {
                reject(new ValidationError('permissions', 'must be an array'));
            } // end if

            if(!_.isUndefined(account.settings) && !_.isPlainObject(account.settings))
            {
                reject(new ValidationError('settings', 'must be a plain object'));
            } // end if

            // We've successfully validated
            resolve(true);
        });
    } // end validateCreate

    validateUpdate(account)
    {
        return new Promise((resolve, reject) =>
        {
            if(!account.account_id && account.account_id !== 0)
            {
                reject(new ValidationError('account_id', 'must be a non-null value'));
            } // end if

            if(!_.isString(account.account_id) && !_.isFinite(account.account_id))
            {
                reject(new ValidationError('account_id', 'must be either a string, or a number'));
            } // end if

            // We've successfully validated
            resolve(true);
        });
    } // end validateUpdate

    validateDelete(account_id)
    {
        return new Promise((resolve, reject) =>
        {
            if(!account_id && account_id !== 0)
            {
                reject(new ValidationError('account_id', 'must be a non-null value'));
            } // end if

            // We've successfully validated
            resolve(true);
        });
    } // end validateDelete
} // end AccountRulesEngine

//----------------------------------------------------------------------------------------------------------------------

module.exports = new AccountRulesEngine();

//----------------------------------------------------------------------------------------------------------------------
