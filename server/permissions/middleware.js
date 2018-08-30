//----------------------------------------------------------------------------------------------------------------------
// Permissions Middleware
//----------------------------------------------------------------------------------------------------------------------

const permSvc = require('./service');
const logger = require('trivial-logging').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

function hasPerm(perm, allowAnon)
{
    return (request, response, next) =>
    {
        if(allowAnon || permSvc.hasPerm(request.user, perm))
        {
            next();
        }
        else
        {
            logger.warn(`User '${ request.user.email }' does not have required permission ${ perm }.`);

            response.status(403).json({
                name: 'PermissionDenied',
                message: `User '${ request.user.email }' does not have required permission.`
            });
        } // end if
    };
} // end hasPerm

function hasGroup(group, allowAnon)
{
    return (request, response, next) =>
    {
        if(allowAnon || permSvc.hasGroup(request.user, group))
        {
            next();
        }
        else
        {
            logger.warn(`User '${ request.user.email }' does not have required group ${ group }.`);

            response.status(403).json({
                name: 'PermissionDenied',
                message: `User '${ request.user.email }' is a not a member of required group.`
            });
        } // end if
    };
} // end hasGroup

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    hasPerm,
    hasGroup
}; // end exports

//----------------------------------------------------------------------------------------------------------------------
