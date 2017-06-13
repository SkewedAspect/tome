//----------------------------------------------------------------------------------------------------------------------
// Account REST API
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const Promise = require('bluebird');
const express = require('express');

const permSvc = require('../permissions/service');
const { hasPerm } = require('../permissions/middleware');

const { interceptHTML, ensureAuthenticated, promisify } = require('./utils');
const models = require('../models');

const logger = require('trivial-logging').loggerFor(module);

//----------------------------------------------------------------------------------------------------------------------

const router = express.Router();

//----------------------------------------------------------------------------------------------------------------------

function findInheritedPerm(path, action)
{
    if(path !== '/')
    {
        return models.Page.getAll(path, { index: 'path' })
            .then((pages) =>
            {
                let perm = 'inherit';
                if(pages && pages.length > 0)
                {
                    perm = pages[0].actions[action];
                } // end if

                if(perm === 'inherit')
                {
                    // Drop the last item off path
                    path = path.split('/').slice(0, -1).join('/') || '/';

                    // Keep looking for a real permission
                    return findInheritedPerm(path, action);
                }
                else
                {
                    return perm;
                } // end if
            });
    } // end if

    return Promise.resolve();
} // end findInheritedPerm

//----------------------------------------------------------------------------------------------------------------------

router.get('*', (request, response) =>
{
    interceptHTML(response, promisify((req, resp) =>
        {
            let path = req.params[0] || '/';
            return models.Page.getAll(path, { index: 'path' })
                .then((pages) =>
                {
                    if(pages && pages.length > 0)
                    {
                        const page = pages[0];

                        // We skip all permission checks for reading '/'. That page is always accessible.
                        if(path === '/')
                        {
                            return page;
                        }
                        else
                        {
                            // Get the special read permission, if there is one. (This may involve walking backwards up
                            // the path, checking for inherited permissions.)
                            let permPromise = Promise.resolve(page.actions.view);
                            if(page.actions.view === 'inherit')
                            {
                                // Drop the last item off path
                                path = path.split('/').slice(0, -1).join('/') || '/';
                                permPromise = findInheritedPerm(path, 'view');
                            } // end if

                            return permPromise.then((requiredPerm) =>
                            {
                                // If we have a required permission, and no user, we will simply fail.
                                if(requiredPerm && !permSvc.hasPerm(req.user || { permissions: [] }, requiredPerm))
                                {
                                    const email = _.get(req, 'user.email', 'anonymous');
                                    logger.warn(`User '${ email }' does not have required permission ${ requiredPerm }.`);

                                    response.status(403).json({
                                        name: 'Permission Denied',
                                        message: `User '${ email }' does not have required permission.`
                                    });
                                }
                                else
                                {
                                    return page;
                                } // end if
                            });
                        } // end if
                    }
                    else
                    {
                        // Page not found.
                        resp.status(404).end();
                    } // end if
                });
        }));
});

router.post('*', ensureAuthenticated, hasPerm('wiki/update'), promisify((req, resp) =>
{
    const path = req.params[0] || '/';
    return models.Page.getAll(path, { index: 'path' })
        .then((pages) =>
        {
            if(pages && pages.length > 0)
            {
                return findInheritedPerm(path, 'update')
                    .then((requiredPerm) =>
                    {
                        // If we have a required permission, and no user, we will simply fail.
                        if(requiredPerm && !permSvc.hasPerm(req.user || { permissions: [] }, requiredPerm))
                        {
                            const email = _.get(req, 'user.email', 'anonymous');
                            logger.warn(`User '${ email }' does not have required permission ${ requiredPerm }.`);

                            resp.status(403).json({
                                name: 'Permission Denied',
                                message: `User '${ email }' does not have required permission.`
                            });
                        }
                        else
                        {
                            const page = pages[0];

                            if(page.revisions[0].id === req.body.lastRevision)
                            {
                                // Update main page properties
                                _.assign(page, {
                                    path,
                                    title: req.body.title,
                                    actions: req.body.actions || {}
                                });

                                // Insert new revision
                                page.revisions.unshift({
                                    content: req.body.content,
                                    user: req.user.email
                                });

                                return page.save();
                            }
                            else
                            {
                                // Page has been updated since
                                resp.status(409).json({
                                    name: 'Last Revision Mismatch',
                                    message: `The last revision submitted was '${ req.lastRevision }', however, the current last revision is '${ page.revisions[0].id }'.`
                                });
                            } // end if
                        } // end if
                    });
            }
            else
            {
                // Page not found.
                resp.status(404).json({
                    name: 'Page does not exist',
                    message: `The page at '${ path }' does not exist.`
                });
            } // end if
        });
}));

router.put('*', ensureAuthenticated, hasPerm('wiki/create'), promisify((req, resp) =>
{
    const path = req.params[0] || '/';
    return models.Page.getAll(path, { index: 'path' })
        .then((pages) =>
        {
            if(!pages || pages.length === 0)
            {
                return findInheritedPerm(path, 'create')
                    .then((requiredPerm) =>
                    {
                        // If we have a required permission, and no user, we will simply fail.
                        if(requiredPerm && !permSvc.hasPerm(req.user || { permissions: [] }, requiredPerm))
                        {
                            const email = _.get(req, 'user.email', 'anonymous');
                            logger.warn(`User '${ email }' does not have required permission ${ requiredPerm }.`);

                            resp.status(403).json({
                                name: 'Permission Denied',
                                message: `User '${ email }' does not have required permission.`
                            });
                        }
                        else
                        {
                            const page = new models.Page({
                                path,
                                title: req.body.title,
                                revisions: [{
                                    content: req.body.content,
                                    user: req.user.email
                                }],
                                actions: req.body.actions || {}
                            });

                            return page.save();
                        } // end if
                    });
            }
            else
            {
                // Page already exists
                resp.status(409).json({
                    name: 'Page Already Exists',
                    message: `The page at '${ path }' already exists.`
                });
            } // end if
        });
}));

router.delete('*', ensureAuthenticated, hasPerm('wiki/delete'), promisify((req, resp) =>
{
    const path = req.params[0] || '/';
    if(path === '/')
    {
        resp.status(403).json({
            name: 'Cannot delete root page.',
            message: `The root wiki page '/' cannot be deleted.`
        });
    }
    else
    {
        return models.Page.getAll(path, { index: 'path' })
            .then((pages) =>
            {
                if(pages && pages.length > 0)
                {
                    return findInheritedPerm(path, 'delete')
                        .then((requiredPerm) =>
                        {
                            // If we have a required permission, and no user, we will simply fail.
                            if(requiredPerm && !permSvc.hasPerm(req.user || { permissions: [] }, requiredPerm))
                            {
                                const email = _.get(req, 'user.email', 'anonymous');
                                logger.warn(`User '${ email }' does not have required permission ${ requiredPerm }.`);

                                resp.status(403).json({
                                    name: 'Permission Denied',
                                    message: `User '${ email }' does not have required permission.`
                                });
                            }
                            else
                            {
                                const page = pages[0];
                                return page.delete().then(() => {});
                            } // end if
                        });
                }
                else
                {
                    // Page not found.
                    resp.status(404).json({
                        name: 'Page does not exist',
                        message: `The page at '${ path }' does not exist.`
                    });
                } // end if
            });
    } // end if
}));

//----------------------------------------------------------------------------------------------------------------------

module.exports = router;

//----------------------------------------------------------------------------------------------------------------------
