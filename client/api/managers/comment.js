//----------------------------------------------------------------------------------------------------------------------
// CommentManager
//----------------------------------------------------------------------------------------------------------------------

import { BehaviorSubject } from 'rxjs';

// Managers
import authMan from './auth.js';

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
        return commentRA.deleteComment(comment);
    } // end deleteComment
} // end CommentManager

//----------------------------------------------------------------------------------------------------------------------

export default new CommentManager();

//----------------------------------------------------------------------------------------------------------------------
