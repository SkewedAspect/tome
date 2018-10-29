//----------------------------------------------------------------------------------------------------------------------
// AccountResourceAccess
//----------------------------------------------------------------------------------------------------------------------

import _ from 'lodash';
import $http from 'axios';

// Models
import AccountModel from '../models/account';

// Errors
import { AppError } from '../../../server/api/errors';

//----------------------------------------------------------------------------------------------------------------------

class AccountResourceAccess
{
    constructor()
    {
        this.$accounts = {};
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------

    _buildModel(def)
    {
        let accountInst = this.$accounts[def.account_id];
        if(accountInst)
        {
            accountInst.update(def);
        }
        else
        {
            accountInst = new AccountModel(def);
            this.$accounts[def.account_id] = accountInst;
        } // end if

        return accountInst;
    } // end _buildModel

    //------------------------------------------------------------------------------------------------------------------

    getAccount(account_id)
    {
        return $http.get(`/account/${ account_id }`)
            .catch((error) =>
            {
                const contentType = error.response.headers['content-type'].toLowerCase();
                if(_.includes(contentType, 'application/json'))
                {
                    const { data } = error.response;
                    throw AppError.fromJSON(data);
                }
                else
                {
                    throw error;
                } // end if
            })
            .then(({ data }) => data)
            .then((accountDef) => this._buildModel(accountDef));
    } // end getAccount
} // end AccountResourceAccess

//----------------------------------------------------------------------------------------------------------------------

export default new AccountResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
