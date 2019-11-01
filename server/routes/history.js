//----------------------------------------------------------------------------------------------------------------------
// Page History REST API
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const express = require('express');

const { interceptHTML, promisify } = require('./utils');

// Managers
const wikiMan = require('../api/managers/wiki');
const permsMan = require('../api/managers/permissions');

//----------------------------------------------------------------------------------------------------------------------

const router = express.Router();

//----------------------------------------------------------------------------------------------------------------------

function getUser(req)
{
    return _.get(req, 'user', { username: 'anonymous', permissions: [], groups: [] });
} // end getUser

function getPath(req)
{
    let path = _.get(req, 'params[0]', '/');
    if(path.length > 1 && path.substr(-1) === '/')
    {
        path = path.substr(0, path.length - 1);
    } // end if

    return path;
} // end getPath

//----------------------------------------------------------------------------------------------------------------------

router.get('*', (request, response) =>
{
    interceptHTML(response, promisify((req, resp) =>
    {
        const path = getPath(req);

        return wikiMan.getHistory(path)
            .then((page) =>
            {
                const user = getUser(req);
                const viewPerm = `wikiView/${ page.actions.wikiView }`;
                if(viewPerm !== 'wikiView/*' && !permsMan.hasPerm(user, viewPerm))
                {
                    resp.status(403).json({
                        name: 'Permission Denied',
                        code: 'ERR_PERMISSION',
                        message: `User '${ user.username }' does not have required permission.`
                    });
                }
                else if(page.body === null)
                {
                    // Treat null body as deleted.
                    resp.status(404).json({
                        name: 'Page not found',
                        code: 'ERR_NOT_FOUND',
                        message: `No page found for path '${ path }'.`
                    });
                }
                else
                {
                    return page;
                } // end if
            })
            .catch({ code: 'ERR_NOT_FOUND' }, () =>
            {
                resp.status(404).json({
                    name: 'Page not found',
                    code: 'ERR_NOT_FOUND',
                    message: `No page found for path '${ path }'.`
                });
            });
    }));
});

//----------------------------------------------------------------------------------------------------------------------

module.exports = router;

//----------------------------------------------------------------------------------------------------------------------
