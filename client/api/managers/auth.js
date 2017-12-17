//----------------------------------------------------------------------------------------------------------------------
// AuthManager
//
// @module
//----------------------------------------------------------------------------------------------------------------------

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// Resource Access
import authRA from '../resource-access/auth';

//----------------------------------------------------------------------------------------------------------------------

class AuthManager
{
    constructor()
    {
        // Subjects
        this._accountSubject = new BehaviorSubject();
        this._statusSubject = new BehaviorSubject('unknown');

        // We have to expose this to window for Google to pick it up.
        window.onGoogleInit = this._onGoogleInit.bind(this);
        window.onGoogleSignIn = this._onGoogleSignIn.bind(this);
        window.onGoogleFailure = this._onGoogleFailure.bind(this);

        this.loading = new Promise((resolve) =>
        {
            const subscription = this.status$.subscribe((status) =>
            {
                if(status === 'gapi loaded')
                {
                    resolve();
                    subscription.unsubscribe();
                } // end if
            });
        });
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Observables
    //------------------------------------------------------------------------------------------------------------------

    get account$(){ return this._accountSubject.asObservable(); }
    get status$(){ return this._statusSubject.asObservable(); }

    //------------------------------------------------------------------------------------------------------------------
    // Properties
    //------------------------------------------------------------------------------------------------------------------

    get account(){ return this._accountSubject.getValue(); }
    get status(){ return this._statusSubject.getValue(); }

    //------------------------------------------------------------------------------------------------------------------
    // Events
    //------------------------------------------------------------------------------------------------------------------

    _onGoogleInit()
    {
        gapi.load('auth2', () =>
        {
            gapi.auth2.init();
            this.auth2 = gapi.auth2.getAuthInstance();

            // Update our status
            this._statusSubject.next('gapi loaded');

            // We listen for the current user to change
            this.auth2.currentUser.listen((googleUser) =>
            {
                if(googleUser.isSignedIn())
                {
                    this._onGoogleSignIn(googleUser);
                }
                else
                {
                    this._accountSubject.next();
                    this._statusSubject.next('signed out');
                } // end if
            });
        });
    } // end _onGoogleInit

    _onGoogleSignIn(googleUser)
    {
        return this.$completeSignIn(googleUser.getAuthResponse().id_token);
    } // end _onGoogleSignIn

    _onGoogleFailure(error)
    {
        console.warn('Google Sign In failure:', error);
    } // end _onGoogleFailure

    $completeSignIn(idToken)
    {
        this._statusSubject.next('signing in');
        return authRA.completeSignIn(idToken)
            .then((account) =>
            {
                this._accountSubject.next(account);
                this._statusSubject.next('signed in');
            })
            .catch((error) =>
            {
                console.error('Failed to complete sign in:', error);
                this._statusSubject.next('signed out');
            });
    } // end $completeSignIn

    //------------------------------------------------------------------------------------------------------------------
    // Public
    //------------------------------------------------------------------------------------------------------------------

    attachSignIn(elem)
    {
        return this.loading
            .then(() =>
            {
                this.auth2.attachClickHandler(elem, {}, () => {}, this._onGoogleFailure.bind(this));
            });
    } // end attachSignIn

    signOut()
    {
        this.auth2.signOut();
        return authRA.signOut();
    } // end signOut
} // end AuthManager

//----------------------------------------------------------------------------------------------------------------------

export default new AuthManager();

//----------------------------------------------------------------------------------------------------------------------
