//----------------------------------------------------------------------------------------------------------------------
// PermissionsManager
//----------------------------------------------------------------------------------------------------------------------

import Promise from 'bluebird';
import trivialPerms from 'trivialperms';

import rolesRA from'../resource-access/roles';

//----------------------------------------------------------------------------------------------------------------------

class PermissionsManager
{
    constructor()
    {
        trivialPerms.loadGroups(() =>
        {
            return Promise.resolve(rolesRA.getRoles());
        });
    } // end constructor

    hasPerm(...args)
    {
        return trivialPerms.hasPerm(...args);
    } // end hasPerm

    hasGroup(...args)
    {
        return trivialPerms.hasGroup(...args);
    } // end hasGroup
} // end PermissionsManager

//----------------------------------------------------------------------------------------------------------------------

module.exports = new PermissionsManager();

//----------------------------------------------------------------------------------------------------------------------
