//----------------------------------------------------------------------------------------------------------------------
// CommentsRulesEngine
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const Promise = require('bluebird');
const { ValidationError } = require('../errors');

//----------------------------------------------------------------------------------------------------------------------

class CommentsRulesEngine
{
    validateCommentID(commentID)
    {
        return new Promise((resolve, reject) =>
        {
            if(!_.isString(commentID) && !_.isFinite(commentID))
            {
                reject(new ValidationError('commentID', 'must be either a string, or a number'));
            } // end if

            // We've successfully validated
            resolve(true);
        });
    } // end validateCommentID

    validateComment(comment)
    {
        return new Promise((resolve, reject) =>
        {
            if(!_.isString(comment.title) || comment.title.length === 0)
            {
                reject(new ValidationError('title', 'must be a non-empty string'));
            } // end if

            if(!_.isString(comment.body) || comment.body.length === 0)
            {
                reject(new ValidationError('body', 'must be a non-empty string'));
            } // end if

            if(!_.isString(comment.page_id) && !_.isFinite(comment.page_id))
            {
                reject(new ValidationError('page_id', 'must be either a string, or a number'));
            } // end if

            // We've successfully validated
            resolve(true);
        });
    } // end validateComment
} // end CommentsRulesEngine

//----------------------------------------------------------------------------------------------------------------------

module.exports = new CommentsRulesEngine();

//----------------------------------------------------------------------------------------------------------------------
