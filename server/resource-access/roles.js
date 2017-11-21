//----------------------------------------------------------------------------------------------------------------------
// RoleResourceAccess
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const dbMan = require('../database');

//----------------------------------------------------------------------------------------------------------------------

const db = dbMan.getDB();

//----------------------------------------------------------------------------------------------------------------------

class RoleResourceAccess
{
    getRoles()
    {
        return db('role')
            .select()
            .map((role) =>
            {
                // We store the permissions as a JSON string, because that's way easier than doing crazy joins.
                // And this doesn't add much overhead at all.
                role.permissions = JSON.parse(role.permissions);
                return role;
            });
    } // end getRoles

    addRole(role)
    {
        // Don't modify what was passed in
        role = _.cloneDeep(role);

        // We need to store the permissions as a string
        role.permissions = JSON.stringify(_.get(role, 'permissions', []));

        // Insert the role, and then unwrap the new id
        return db('role')
            .insert(role)
            .then(([ id ]) => ({ id }));
    } // end addRole

    deleteRole(role_id)
    {
        if(!role_id)
        {
            throw new Error('Cannot delete a role without `role_id`.');
        } // end if

        return db('role')
            .where({ role_id })
            .delete()
            .then((rows) => ({ rowsAffected: rows }));
    } // end deleteRole
} // end RoleResourceAccess

//----------------------------------------------------------------------------------------------------------------------

module.exports = new RoleResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
