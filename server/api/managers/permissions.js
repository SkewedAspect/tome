//----------------------------------------------------------------------------------------------------------------------
// PermissionsManager
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

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    getRoles()
    {
        return rolesRA.getRoles()
            .then((roles) => roles || []);
    } // end getRoles

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
