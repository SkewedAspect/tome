//----------------------------------------------------------------------------------------------------------------------
// CommentResourceAccess
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const dbMan = require('../database');

//----------------------------------------------------------------------------------------------------------------------

class CommentResourceAccess
{
    constructor()
    {
        this.loading = dbMan.getDB();
    } // end constructor

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
        return this.loading
            .then((db) => db('comment')
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
            .map(this._mungeComment));
    } // end getComments

    addComment(comment)
    {
        return this.loading
            .then((db) => db('comment')
            .insert(_.pick(comment, 'page_id', 'title', 'body', 'account_id'))
            .then(([ id ]) => ({ id })));
    } // end addComment

    updateComment(comment)
    {
        const comment_id = comment.comment_id;
        comment = _.pick(comment, 'page_id', 'title', 'body', 'account_id');
        comment.edited = new Date();

        return this.loading
            .then((db) => db('comment')
            .update(comment)
            .where({ comment_id }));
    } // end updateComment

    deleteComment(comment_id)
    {
        return this.loading
            .then((db) => db('comment')
            .where({ comment_id })
            .delete());
    } // end deleteComment
} // end CommentResourceAccess

//----------------------------------------------------------------------------------------------------------------------

module.exports = new CommentResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
