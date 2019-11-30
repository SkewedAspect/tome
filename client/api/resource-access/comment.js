//----------------------------------------------------------------------------------------------------------------------
// CommentResourceAccess
//----------------------------------------------------------------------------------------------------------------------

import _ from 'lodash';
import $http from 'axios';

// Resource Access
import accountRA from './account';

// Models
import CommentModel from '../models/comment';

// Errors
import { AppError } from '../../../server/api/errors';

//----------------------------------------------------------------------------------------------------------------------

/* eslint-disable camelcase */

class CommentResourceAccess
{
    constructor()
    {
        this.$comments = {};
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------

    _buildModel(def)
    {
        let commentInst = this.$comments[def.comment_id];
        if(commentInst)
        {
            commentInst.update(def);
        }
        else
        {
            commentInst = new CommentModel(def);
            this.$comments[def.comment_id] = commentInst;
        } // end if

        return commentInst;
    } // end _buildModel

    //------------------------------------------------------------------------------------------------------------------

    copyComment(comment)
    {
        return new CommentModel({
            title: comment.title,
            body: comment.body,
            created: comment.created,
            edited: comment.edited,
            page_id: comment.page_id,
            account_id: comment.account_id,
            path: comment.path,
            comment_id: comment.comment_id
        });
    } // end copyComment

    createComment(path, account_id)
    {
        return new CommentModel({
            title: '',
            body: '',
            created: new Date(),
            edited: new Date(),
            page_id: undefined,
            account_id,
            path
        });
    } // end createComment

    getComments(path)
    {
        // We always attempt to get the latest comments, and update our in-memory models, or make new ones.
        return $http.get(`/comment${ path }`)
            .catch((error) =>
            {
                const contentType = error.response.headers['content-type'].toLowerCase();
                if(_.includes(contentType, 'application/json'))
                {
                    const { data } = error.response;
                    throw AppError.fromJSON(data);
                }
                else
                {
                    throw error;
                } // end if
            })
            .then(({ data }) => data)
            .map((def) =>
            {
                return accountRA.getAccount(def.account_id)
                    .then((account) =>
                    {
                        def.$account = account;
                        return this._buildModel(def);
                    });
            });
    } // end getComments

    saveComment(comment)
    {
        const verb = comment.comment_id ? 'patch' : 'post';
        return $http[verb](`/comment${ comment.path }/${ comment.comment_id || '' }`, comment)
            .then(({ data }) =>
            {
                comment.update(data);
            });
    } // end saveComment

    deleteComment(comment)
    {
        return $http.delete(`/comment${ comment.path }/${ comment.comment_id }`)
            .then(() =>
            {
                const commentInst = this.$comments[comment.id];
                if(commentInst)
                {
                    delete this.$comments[comment.id];
                } // end if
            });
    } // end deleteComment

    getRecent(max)
    {
        return $http.get('/recent/comments', { params: { max } })
            .then(({ data }) => data);
    } // end getRecent
} // end CommentResourceAccess

//----------------------------------------------------------------------------------------------------------------------

export default new CommentResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
