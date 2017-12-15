//----------------------------------------------------------------------------------------------------------------------
// Comments REST API
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const express = require('express');

const { interceptHTML, ensureAuthenticated, promisify } = require('./utils');

// Managers
const wikiMan = require('../managers/wiki');
const permsMan = require('../managers/permissions');

const { AppError } = require('../errors');

//----------------------------------------------------------------------------------------------------------------------

const router = express.Router();

//----------------------------------------------------------------------------------------------------------------------

function getUser(req)
{
    return _.get(req, 'user', { username: 'anonymous', permissions: [], groups: [] });
} // end getUser

function getPath(req)
{
    let path = req.params[0] || '/';
    if(path.length > 1 && path.substr(-1) === '/')
    {
        path = path.substr(0, path.length - 1);
    } // end if

    return path
} // end getPath

function getPage(path, user, perm='wikiView')
{
    return wikiMan.getPage(path)
        .tap((page) =>
        {
            const viewPerm = `${ perm }/${ page.actions[perm] }`;
            if(viewPerm !== `${ perm }/*` && !permsMan.hasPerm(user, viewPerm))
            {
                throw new AppError(`User '${ user.username }' does not have required permission.`, 'ERR_PERMISSION');
            }
            else if(page.body === null)
            {
                // Treat null body as deleted.
                throw new AppError(`No page found for path '${ path }'.`, 'ERR_NOT_FOUND');
            } // end if
        });
} // end getPath

//----------------------------------------------------------------------------------------------------------------------

router.get('*', (request, response) =>
{
    interceptHTML(response, promisify((req, resp) =>
        {
            const path = getPath(req);
            const user = getUser(req);
            return getPage(path, user)
                .then(() =>
                {
                    return wikiMan.getComments(path);
                })
                .catch({ code: 'ERR_NOT_FOUND' }, (error) =>
                {
                    resp.status(404).json({
                        name: 'Page not found',
                        code: 'ERR_NOT_FOUND',
                        message: error.message
                    });
                })
                .catch({ code: 'ERR_PERMISSION' }, (error) =>
                {
                    resp.status(403).json({
                        name: 'Permission Denied',
                        code: 'ERR_PERMISSION',
                        message: error.message
                    });
                });
        }));
});

router.post('*', ensureAuthenticated, promisify((req, resp) =>
{
    const path = getPath(req);
    const user = getUser(req);
    return getPage(path, user, 'wikiModify')
        .then((page) =>
        {
            // Replace some properties with server side values.
            const comment = req.body;
            comment.page_id = page.page_id;
            comment.account_id = req.user.account_id;

            return wikiMan.addComment(comment);
        })
        .catch({ code: 'ERR_NOT_FOUND' }, (error) =>
        {
            resp.status(404).json({
                name: 'Page not found',
                code: 'ERR_NOT_FOUND',
                message: error.message
            });
        })
        .catch({ code: 'ERR_PERMISSION' }, (error) =>
        {
            resp.status(403).json({
                name: 'Permission Denied',
                code: 'ERR_PERMISSION',
                message: error.message
            });
        });
}));

router.patch('*/:commentID', ensureAuthenticated, promisify((req, resp) =>
{
    const path = getPath(req);
    const user = getUser(req);

    return getPage(path, user, 'wikiModify')
        .then((page) =>
        {
            return wikiMan.getComment(req.params.commentID)
                .then((currentComment) =>
                {
                    if(currentComment.page_id === page.page_id)
                    {
                        if(currentComment.account_id === user.account_id || permsMan.hasPerm(user, 'Comments/canEditAny'))
                        {
                            // Replace some properties with server side values.
                            const comment = req.body;
                            comment.comment_id = req.params.commentID;
                            comment.page_id = page.page_id;

                            return wikiMan.editComment(comment);
                        }
                        else
                        {
                            resp.status(403).json({
                                name: 'Permission Denied',
                                code: 'ERR_PERMISSION',
                                message: `User '${ user.username }' does not have required permission.`
                            });
                        } // end if
                    }
                    else
                    {
                        resp.status(404).json({
                            name: 'Comment not found',
                            code: 'ERR_NOT_FOUND',
                            message: `No comment with id '${ currentComment.comment_id }' found on page with path '${ path }'.`
                        });
                    } // end if
                });
        })
        .catch({ code: 'ERR_NOT_FOUND' }, (error) =>
        {
            resp.status(404).json({
                name: 'Comment not found',
                code: 'ERR_NOT_FOUND',
                message: error.message
            });
        })
        .catch({ code: 'ERR_PERMISSION' }, (error) =>
        {
            resp.status(403).json({
                name: 'Permission Denied',
                code: 'ERR_PERMISSION',
                message: error.message
            });
        });

}));

router.delete('*/:commentID', ensureAuthenticated, promisify((req, resp) =>
{
    const path = getPath(req);
    const user = getUser(req);

    return getPage(path, user, 'wikiModify')
        .then((page) =>
        {
            return wikiMan.deleteComment(page.page_id, req.params.commentID)
                .then(() => ({ status: 'success' }))
                .catch({ code: 'ERR_NOT_FOUND' }, (error) =>
                {
                    resp.status(404).json({
                        name: 'Comment not found',
                        code: 'ERR_NOT_FOUND',
                        message: error.message
                    });
                });
        })
        .catch({ code: 'ERR_NOT_FOUND' }, (error) =>
        {
            resp.status(404).json({
                name: 'Page not found',
                code: 'ERR_NOT_FOUND',
                message: error.message
            });
        })
        .catch({ code: 'ERR_PERMISSION' }, (error) =>
        {
            resp.status(403).json({
                name: 'Permission Denied',
                code: 'ERR_PERMISSION',
                message: error.message
            });
        });
}));

//----------------------------------------------------------------------------------------------------------------------

module.exports = router;

//----------------------------------------------------------------------------------------------------------------------
