//----------------------------------------------------------------------------------------------------------------------
// CommentResourceAccess
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const dbMan = require('../database');

//----------------------------------------------------------------------------------------------------------------------

const db = dbMan.getDB();

//----------------------------------------------------------------------------------------------------------------------

class CommentResourceAccess
{
    //------------------------------------------------------------------------------------------------------------------
    // Utility Functions
    //------------------------------------------------------------------------------------------------------------------

    _mungeComment(comment)
    {
        comment.created = new Date(comment.created);
        comment.edited = new Date(comment.edited);

        return comment;
    } // end _mungeWikiPage

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    getComments(path)
    {
        if(!path)
        {
            throw new Error('Cannot get comments for a wiki page without `path`.');
        } // end if

        return db('comment')
            .select(
                'comment.comment_id',
                'comment.title',
                'comment.body',
                'comment.created',
                'comment.edited',
                'comment.account_id',
                'comment.page_id')
            .innerJoin('page', 'comment.page_id', 'page.page_id')
            .where('page.path', '=', path)
            .orderBy('comment.created')
            .map(this._mungeComment);
    } // end getComments

    addComment(page_id, title, body, account_id)
    {
        if(!page_id)
        {
            throw new Error('Cannot add a comment for a wiki page without `page_id`.');
        } // end if

        return db('comment')
            .insert({ page_id, title, body, account_id })
            .then(([ id ]) => ({ id }));
    } // end addComment

    updateComment(comment)
    {
        if(!comment.comment_id)
        {
            throw new Error('Cannot update a comment  without `comment_id`.');
        } // end if

        const comment_id = comment.comment_id;
        comment = _.omit(comment, 'comment_id', 'account_id', 'created', 'page_id');

        return db('comment')
            .update(comment)
            .where({ comment_id });
    } // end updateComment

    deleteComment(comment_id)
    {
        if(!comment_id)
        {
            throw new Error('Cannot update a comment  without `comment_id`.');
        } // end if

        return db('comment')
            .where({ comment_id })
            .delete();
    } // end deleteComment
} // end CommentResourceAccess

//----------------------------------------------------------------------------------------------------------------------

module.exports = new CommentResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
