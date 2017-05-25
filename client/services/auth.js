//----------------------------------------------------------------------------------------------------------------------
// AuthService
//
// @module
//----------------------------------------------------------------------------------------------------------------------

import $http from 'axios';

import accountSvc from './account';
import BaseService from './base';

//----------------------------------------------------------------------------------------------------------------------

class AuthService extends BaseService
{
    constructor()
    {
        super();
    } // end constructor

    login(idToken)
    {
        return $http.post('/auth/google', { idToken })
            .get('data')
            .then((account) =>
            {
                console.log('account:', account);
                accountSvc.account = account;
            })
            .catch((error) =>
            {
                accountSvc.account = undefined;
                console.error('Error logging in:', error);
            });
    } // end login
} // end AuthService

//----------------------------------------------------------------------------------------------------------------------

export default new AuthService();

//----------------------------------------------------------------------------------------------------------------------
