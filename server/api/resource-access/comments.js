//----------------------------------------------------------------------------------------------------------------------
// CommentResourceAccess
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const dbMan = require('../../database');

const { MultipleResultsError, NotFoundError } = require('../errors');

//----------------------------------------------------------------------------------------------------------------------

/* eslint-disable camelcase */

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
        comment.created = Date.parse(`${ comment.created } GMT`);
        comment.edited = Date.parse(`${ comment.edited } GMT`);

        return comment;
    } // end _mungeWikiPage

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    getComment(comment_id)
    {
        return this.loading
            .then((db) => db('comment')
                .select()
                .where({ comment_id }))
            .then((comments) =>
            {
                if(comments.length > 1)
                {
                    throw new MultipleResultsError('comment');
                }
                else if(comments.length === 0)
                {
                    throw new NotFoundError(`No comment with id '${ comment_id }' found.`);
                }
                else
                {
                    return this._mungeComment(comments[0]);
                } // end if
            });
    } // end getComment

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
                    'comment.page_id'
                )
                .innerJoin('page', 'comment.page_id', 'page.page_id')
                .where('page.path', '=', path)
                .orderBy('comment.created')
                .map(this._mungeComment));
    } // end getComments

    getRecentComments(max = 25)
    {
        return this.loading
            .then((db) =>
            {
                let query = db('comment')
                    .select(
                        'comment.comment_id',
                        'comment.title',
                        'comment.body',
                        'comment.created',
                        'comment.edited',
                        'comment.account_id',
                        'comment.page_id',
                        'page.path as page_path',
                        'page.title as page_title',
                        'account.username as username'
                    )
                    .innerJoin('page', 'comment.page_id', 'page.page_id')
                    .innerJoin('account', 'comment.account_id', 'account.account_id')
                    .orderBy('comment.created', 'desc');

                if(max)
                {
                    query = query.limit(max);
                } // end if

                return query;
            })
            .map(this._mungeComment)
            .map((comment) =>
            {
                return {
                    ...comment,
                    body: _.truncate(comment.body, { length: 75 })
                };
            });
    } // end getRecentComments

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

        return this.loading
            .then((db) => db('comment')
                .update({ ...comment, edited: db.fn.now() })
                .where({ comment_id }));
    } // end updateComment

    deleteComment(page_id, comment_id)
    {
        return this.loading
            .then((db) => db('comment')
                .where({ page_id, comment_id })
                .delete())
            .then((rowsAffected) =>
            {
                if(rowsAffected === 0)
                {
                    throw new NotFoundError(`No comment with id '${ comment_id }' found on page with id '${ page_id }'.`);
                } // end if
            });
    } // end deleteComment
} // end CommentResourceAccess

//----------------------------------------------------------------------------------------------------------------------

module.exports = new CommentResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
