//----------------------------------------------------------------------------------------------------------------------
// Account REST API
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const express = require('express');

const { interceptHTML, promisify } = require('./utils');

// Managers
const permsMan = require('../api/managers/permissions');
const wikiMan = require('../api/managers/wiki');

//----------------------------------------------------------------------------------------------------------------------

const router = express.Router();

//----------------------------------------------------------------------------------------------------------------------

function getUser(req)
{
    return _.get(req, 'user', { username: 'anonymous', permissions: [], groups: [] });
} // end getUser

//----------------------------------------------------------------------------------------------------------------------

router.get('/', (request, response) =>
{
    interceptHTML(response, promisify((req) =>
    {
        return wikiMan.searchPages(_.get(request.query, 'term'))
            .then((results) =>
            {
                // We filter out matches that the user isn't allowed to see.
                return _.filter(results, ({ page }) =>
                {
                    const user = getUser(req);
                    const viewPerm = `wikiView/${ page.actions.wikiView }`;
                    if(viewPerm !== 'wikiView/*' && !permsMan.hasPerm(user, viewPerm))
                    {
                        return false;
                    }
                    else
                    {
                        return page.body !== null;
                    } // end if
                });
            });
    }));
});

//----------------------------------------------------------------------------------------------------------------------

module.exports = router;

//----------------------------------------------------------------------------------------------------------------------
