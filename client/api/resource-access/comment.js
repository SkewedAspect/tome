//----------------------------------------------------------------------------------------------------------------------
// CommentResourceAccess
//----------------------------------------------------------------------------------------------------------------------

import _ from 'lodash';
import Promise from 'bluebird';
import $http from 'axios';

// Models
import CommentModel from '../models/comment';

// Errors
import { AppError } from '../../../server/api/errors';

//----------------------------------------------------------------------------------------------------------------------

class CommentResourceAccess
{
    constructor()
    {
        this.$comments = {};
    } // end constructor

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
            this.$comments[def.path] = commentInst;
        } // end if

        return commentInst;
    } // end _buildModel

    createComment(path, account_id)
    {
        return Promise.resolve(new CommentModel({
            title: undefined,
            body: undefined,
            created: new Date(),
            edited: new Date(),
            page_id: undefined,
            account_id,
            path
        }));
    } // end createComment

    getComments(path)
    {
        // We always attempt to get the latest comments, and update our in-memory models, or make new ones.
        return $http.get(`/comments${ path }`)
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
            .then((commentDefs) => _.map(commentDefs, (def) => this._buildModel(def)));
    } // end getComments

    saveComment(comment)
    {
        const verb = !!comment.comment_id ? 'patch' : 'post';
        return $http[verb](`/comment${ comment.path }`, comment)
            .then(({ data }) =>
            {
                comment.update(data);
            });
    } // end saveComment

    deleteComment(comment)
    {
        return $http.delete(`/comment${ comment.path }`)
            .then(() =>
            {
                let commentInst = this.$comments[comment.id];
                if(commentInst)
                {
                    delete this.$comments[comment.id];
                } // end if
            });
    } // end deleteComment
} // end CommentResourceAccess

//----------------------------------------------------------------------------------------------------------------------

export default new CommentResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
