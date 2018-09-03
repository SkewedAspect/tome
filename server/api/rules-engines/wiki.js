//----------------------------------------------------------------------------------------------------------------------
// WikiRulesEngine
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const Promise = require('bluebird');
const { ValidationError } = require('../errors');

//----------------------------------------------------------------------------------------------------------------------

class WikiRulesEngine
{
    validatePageID(pageID)
    {
        return new Promise((resolve, reject) =>
        {
            if(!_.isString(pageID) && !_.isFinite(pageID))
            {
                reject(new ValidationError('pageID', 'must be either a string, or a number'));
            } // end if

            // We've successfully validated
            resolve(true);
        });
    } // end validatePageID

    validatePath(path)
    {
        return new Promise((resolve, reject) =>
        {
            if(!_.isString(path))
            {
                reject(new ValidationError('path', 'must be a string'));
            } // end if

            // We've successfully validated
            resolve(true);
        });
    } // end validatePath

    validatePage(page)
    {
        return new Promise((resolve, reject) =>
        {
            if(!_.isString(page.path))
            {
                reject(new ValidationError('path', 'must be a string'));
            } // end if

            if(!_.isUndefined(page.body) && (!_.isString(page.body) || page.body.length === 0))
            {
                reject(new ValidationError('body', 'must be a non-empty string'));
            } // end if

            if(!_.isUndefined(page.title) && !_.isString(page.title))
            {
                reject(new ValidationError('title', 'must be a string'));
            } // end if

            if(!_.isUndefined(page.action_view) && (!_.isString(page.action_view) || page.action_view.length === 0))
            {
                reject(new ValidationError('action_view', 'must be a non-empty string'));
            } // end if

            if(!_.isUndefined(page.action_modify) && (!_.isString(page.action_modify) || page.action_modify.length === 0))
            {
                reject(new ValidationError('action_modify', 'must be a non-empty string'));
            } // end if

            // We've successfully validated
            resolve(true);
        });
    } // end validatePage

    validateMovePage(oldPath, newPath)
    {
        return new Promise((resolve, reject) =>
        {
            if(!_.isString(oldPath))
            {
                reject(new ValidationError('oldPath', 'must be a string'));
            } // end if

            if(!_.isString(newPath))
            {
                reject(new ValidationError('newPath', 'must be a string'));
            } // end if

            if(oldPath === new Path)
            {
                reject(new ValidationError('newPath', "must not the the same as 'oldPath'"));
            } // end if

            // We've successfully validated
            resolve(true);
        });
    } // end validatePath

    validateSearch(term)
    {
        return new Promise((resolve, reject) =>
        {
            if(!_.isString(term))
            {
                reject(new ValidationError('term', 'must be a string'));
            } // end if

            // We've successfully validated
            resolve(true);
        });
    } // end validateSearch
} // end WikiRulesEngine

//----------------------------------------------------------------------------------------------------------------------

module.exports = new WikiRulesEngine();

//----------------------------------------------------------------------------------------------------------------------
