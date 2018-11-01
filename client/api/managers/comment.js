//----------------------------------------------------------------------------------------------------------------------
// CommentManager
//----------------------------------------------------------------------------------------------------------------------

import { BehaviorSubject } from 'rxjs';

// Managers
import authMan from './auth.js';
import permsMan from './permissions';

// Resource Access
import commentRA from '../resource-access/comment';

//----------------------------------------------------------------------------------------------------------------------

class CommentManager
{
    constructor()
    {
        // Subjects
        this._currentPathSubject = new BehaviorSubject();
        this._currentCommentsSubject = new BehaviorSubject([]);
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Observables
    //------------------------------------------------------------------------------------------------------------------

    get currentPath$(){ return this._currentPathSubject.asObservable(); }
    get currentComments$(){ return this._currentCommentsSubject.asObservable(); }

    //------------------------------------------------------------------------------------------------------------------
    // Properties
    //------------------------------------------------------------------------------------------------------------------

    get currentPath(){ return this._currentPathSubject.getValue(); }
    get currentComments(){ return this._currentCommentsSubject.getValue(); }

    //------------------------------------------------------------------------------------------------------------------
    // Public
    //------------------------------------------------------------------------------------------------------------------

    canEdit(comment)
    {
        const account = authMan.account;
        if(account)
        {
            return comment.account_id === account.account_id || permsMan.hasPerm(account, 'Comments/canEditAny');
        }
        else
        {
            return false
        } // end if
    } // end canEdit

    createComment(path)
    {
        return commentRA.createComment(path, authMan.account.account_id);
    } // end createComment

    selectPage(path)
    {
        this._currentPathSubject.next(path);
        return commentRA.getComments(path)
            .tap((comments) =>
            {
                this._currentCommentsSubject.next(comments);
            });
    } // end selectPage

    saveComment(comment)
    {
        return commentRA.saveComment(comment)
            .then(() =>
            {
                return this.selectPage(this.currentPath);
            });
    } // end saveComment

    deleteComment(comment)
    {
        return commentRA.deleteComment(comment)
            .then(() =>
            {
                return this.selectPage(this.currentPath);
            });
    } // end deleteComment
} // end CommentManager

//----------------------------------------------------------------------------------------------------------------------

export default new CommentManager();

//----------------------------------------------------------------------------------------------------------------------
