//----------------------------------------------------------------------------------------------------------------------
// AuthResourceAccess
//----------------------------------------------------------------------------------------------------------------------

import $http from 'axios';

// Models
import AccountModel from '../models/account';

//----------------------------------------------------------------------------------------------------------------------

class AuthResourceAccess
{
    completeSignIn(idToken)
    {
        return $http.post('/auth/google', { idToken })
            .then(({ data }) => new AccountModel(data));
    } // end completeSignIn

    signOut()
    {
        return $http.post('/auth/logout');
    } // end signOut
} // end AuthResourceAccess

//----------------------------------------------------------------------------------------------------------------------

export default new AuthResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
