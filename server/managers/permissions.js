//----------------------------------------------------------------------------------------------------------------------
// PermissionsManager
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const trivialPerms = require('trivialperms');

const rolesRA = require('../resource-access/roles');

//----------------------------------------------------------------------------------------------------------------------

class PermissionsManager
{
    constructor()
    {
        trivialPerms.loadGroups(() =>
        {
            return rolesRA.getRoles();
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
