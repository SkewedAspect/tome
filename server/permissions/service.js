//----------------------------------------------------------------------------------------------------------------------
// PermissionsService
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const trivialPerms = require('trivialperms');

const models = require('../models');

//----------------------------------------------------------------------------------------------------------------------

class PermissionsService
{
    constructor()
    {
        trivialPerms.loadGroups(() =>
        {
            return models.Group.run();
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
} // end PermissionsService

//----------------------------------------------------------------------------------------------------------------------

module.exports = new PermissionsService();

//----------------------------------------------------------------------------------------------------------------------
