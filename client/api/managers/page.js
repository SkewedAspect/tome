//----------------------------------------------------------------------------------------------------------------------
// PageManager
//
// @module
//----------------------------------------------------------------------------------------------------------------------

import Promise from 'bluebird';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// Resource Access
import wikiRA from '../resource-access/wiki';

//----------------------------------------------------------------------------------------------------------------------

class PageManager
{
    constructor()
    {
        // Subjects
        this._currentPageSubject = new BehaviorSubject();
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Observables
    //------------------------------------------------------------------------------------------------------------------

    get currentPage$(){ return this._currentPageSubject.asObservable(); }

    //------------------------------------------------------------------------------------------------------------------
    // Properties
    //------------------------------------------------------------------------------------------------------------------

    get currentPage(){ return this._currentPageSubject.getValue(); }

    //------------------------------------------------------------------------------------------------------------------
    // Public
    //------------------------------------------------------------------------------------------------------------------

    normalizePath(path)
    {
        if(path.length > 1)
        {
            if(path[0] !== '/')
            {
                path = `/${ path }`;
            } // end if

            if(path.substr(-1) === '/')
            {
                path = path.substr(0, path.length - 1);
            } // end if
        } // end if

        return path
    } // end normalizePath

    selectPage(path)
    {
        if(!this.currentPage || this.currentPage.path !== path)
        {
            return wikiRA.getPage(path)
                .tap((page) =>
                {
                    this._currentPageSubject.next(page);
                });
        }
        else
        {
            return Promise.resolve(this.currentPage);
        } // end if
    } // end selectPage
} // end PageManager

//----------------------------------------------------------------------------------------------------------------------

export default new PageManager();

//----------------------------------------------------------------------------------------------------------------------
