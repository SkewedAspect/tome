//----------------------------------------------------------------------------------------------------------------------
// Wiki REST API
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const Promise = require('bluebird');
const express = require('express');

const { interceptHTML, ensureAuthenticated, promisify } = require('./utils');

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

    return path
} // end getPath

//----------------------------------------------------------------------------------------------------------------------

router.head('*', promisify((req, resp) =>
{
    const path = getPath(req);

    return wikiMan.getPage(path)
        .then((page) =>
        {
            const user = getUser(req);
            const viewPerm = `wikiView/${ page.actions.wikiView }`;
            if(viewPerm !== 'wikiView/*' && !permsMan.hasPerm(user, viewPerm))
            {
                resp.status(403).end();
            }
            else if(page.body === null)
            {
                // Treat null body as deleted.
                resp.status(404).end();
            }
            else
            {
                resp.status(200).end();
            } // end if
        })
        .catch({ code: 'ERR_NOT_FOUND' }, (error) =>
        {
            resp.status(404).end();
        });
}));

router.get('*', (request, response) =>
{
    interceptHTML(response, promisify((req, resp) =>
        {
            const path = getPath(req);

            return wikiMan.getPage(path)
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
                .catch({ code: 'ERR_NOT_FOUND' }, (error) =>
                {
                    resp.status(404).json({
                        name: 'Page not found',
                        code: 'ERR_NOT_FOUND',
                        message: `No page found for path '${ path }'.`
                    });
                });
        }));
});

// Yeah, I know I'm abusing `OPTIONS`, but it's the easiest path forward.
router.options('*', promisify((req, resp) =>
{
    const path = getPath(req);
    return Promise.join(wikiMan.getPermission(path, 'view'), wikiMan.getPermission(path, 'modify'))
        .then(([viewPerm, modifyPerm]) => ({ actions: { wikiView: viewPerm, wikiModify: modifyPerm } }));
}));

router.post('*', ensureAuthenticated, promisify((req, resp) =>
{
    const path = getPath(req);

    // First, we need to get the page, so we can check the permissions.
    return wikiMan.getPage(path)
        .then((page) =>
        {
            resp.status(409).json({
                name: 'Page Already Exists',
                code: 'ERR_PAGE_EXISTS',
                message: `A page already exists at path '${ path }'.`,
                page
            });
        })
        .catch({ code: 'ERR_NOT_FOUND' }, (error) =>
        {
            return wikiMan.getPermission(path, 'modify')
                .then((perm) =>
                {
                    const user = getUser(req);
                    const viewPerm = `wikiModify/${ perm }`;
                    if(viewPerm !== 'wikiModify/*' && !permsMan.hasPerm(user, viewPerm))
                    {
                        resp.status(403).json({
                            name: 'Permission Denied',
                            code: 'ERR_PERMISSION',
                            message: `User '${ user.username }' does not have required permission.`
                        });
                    }
                    else
                    {
                        const newPage = _.merge({}, req.body, { path });
                        return wikiMan.createPage(newPage);
                    } // end if
                });
        });
}));

router.put('*/move', ensureAuthenticated, promisify((req, resp) =>
{
    const path = getPath(req);
    const newPath = _.get(req.body, 'path');

    // First, we need to get the page, so we can check the permissions.
    return wikiMan.getPage(path)
        .then((page) =>
        {
            return wikiMan.getPermission(path, 'modify')
                .then((perm) =>
                {
                    const user = getUser(req);
                    const viewPerm = `wikiModify/${ perm }`;
                    if(viewPerm !== 'wikiModify/*' && !permsMan.hasPerm(user, viewPerm))
                    {
                        resp.status(403).json({
                            name: 'Permission Denied',
                            code: 'ERR_PERMISSION',
                            message: `User '${ user.username }' does not have required permission.`
                        });
                    }
                    else
                    {
                        return wikiMan.movePage(path, newPath)
                            .catch({ code: 'ERR_VALIDATION_FAILED' }, (error) =>
                            {
                                resp.status(409).json({
                                    name: 'Page Already Exists',
                                    code: 'ERR_PAGE_EXISTS',
                                    message: `A page already exists at path '${ newPath }'.`
                                });
                            });
                    } // end if
                });
        })
        .catch({ code: 'ERR_NOT_FOUND' }, (error) =>
        {
            resp.status(404).json({
                name: 'Page not found',
                code: 'ERR_NOT_FOUND',
                message: `No page found for path '${ path }'.`
            });
        });
}));

router.patch('*', ensureAuthenticated, promisify((req, resp) =>
{
    const path = getPath(req);

    // First, we need to get the page, so we can check the permissions.
    return wikiMan.getPage(path)
        .then((page) =>
        {
            const user = getUser(req);

            // Build different permissions
            const modifyPerm = `wikiModify/${ page.actions.wikiModify }`;
            const updatedViewPerm = `wikiView/${ _.get(req.body, 'action_view', page.actions.wikiView) }`;
            const updatedModifyPerm = `wikiModify/${ _.get(req.body, 'action_modify', page.actions.wikiModify) }`;

            // Build Perms Checks
            const userNotHasPerm = modifyPerm !== 'wikiModify/*' && !permsMan.hasPerm(user, modifyPerm);
            const userNotHasUpViewPerm = updatedViewPerm !== 'wikiView/*' && !permsMan.hasPerm(user, updatedViewPerm);
            const userNotHasUpModPerm = updatedModifyPerm !== 'wikiModify/*' && !permsMan.hasPerm(user, updatedModifyPerm);
            if(userNotHasPerm || userNotHasUpViewPerm || userNotHasUpModPerm)
            {
                resp.status(403).json({
                    name: 'Permission Denied',
                    code: 'ERR_PERMISSION',
                    message: `User '${ user.username }' does not have required permission.`
                });
            }
            else
            {
                const newPage = _.merge({}, req.body, { path, page_id: page.page_id });
                if(newPage.revision_id !== page.revision_id)
                {
                    resp.status(409).json({
                        name: 'Version Conflict',
                        code: 'ERR_VERSION_CONFLICT',
                        message: `Edit made against older revision than most recent revision for '${ path }'.`,
                        page
                    });
                }
                else
                {
                    return wikiMan.editPage(newPage);
                } // end if
            } // end if
        })
        .catch({ code: 'ERR_NOT_FOUND' }, (error) =>
        {
            resp.status(404).json({
                name: 'Page not found',
                code: 'ERR_NOT_FOUND',
                message: `No page found for path '${ path }'.`
            });
        });
}));

router.delete('*', ensureAuthenticated, promisify((req, resp) =>
{
    const path = getPath(req);

    // First, we need to get the page, so we can check the permissions.
    return wikiMan.getPage(path)
        .then((page) =>
        {
            const user = getUser(req);
            const viewPerm = `wikiModify/${ page.actions.wikiModify }`;
            if(viewPerm !== 'wikiModify/*' && !permsMan.hasPerm(user, viewPerm))
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
                return wikiMan.deletePage(path)
                    .then(() => ({ status: 'success' }));
            } // end if
        })
        .catch({ code: 'ERR_NOT_FOUND' }, (error) =>
        {
            resp.status(404).json({
                name: 'Page not found',
                code: 'ERR_NOT_FOUND',
                message: `No page found for path '${ path }'.`
            });
        });
}));

//----------------------------------------------------------------------------------------------------------------------

module.exports = router;

//----------------------------------------------------------------------------------------------------------------------
