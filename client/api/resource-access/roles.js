//----------------------------------------------------------------------------------------------------------------------
// RolesResourceAccess
//----------------------------------------------------------------------------------------------------------------------

import $http from 'axios';

//----------------------------------------------------------------------------------------------------------------------

class RolesResourceAccess
{
    getRoles()
    {
        return $http.get('/roles')
            .then(({ data }) => data)
            .catch((error) =>
            {
                console.error('Error getting account roles:', error);
                return [];
            });
    } // end getRoles
} // end RolesResourceAccess

//----------------------------------------------------------------------------------------------------------------------

export default new RolesResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
