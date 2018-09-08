//----------------------------------------------------------------------------------------------------------------------
// WikiManager
//----------------------------------------------------------------------------------------------------------------------

import Promise from 'bluebird';
import { BehaviorSubject } from 'rxjs';

// Managers
import authMan from './auth.js';
import permsMan from './permissions';

// Resource Access
import wikiRA from '../resource-access/wiki';

//----------------------------------------------------------------------------------------------------------------------

class WikiManager
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

    createPage(path)
    {
        return wikiRA.createPage(path)
            .then((page) => this._currentPageSubject.next(page))
    } // end createPage

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

    savePage()
    {
        return wikiRA.savePage(this.currentPage);
    } // end save

    searchPages(term)
    {
        if(term)
        {
            return wikiRA.searchPages(term);
        }
        else
        {
            return Promise.resolve([]);
        } // end if
    } // end searchPage

    canView(page)
    {
        const user = authMan.account || { permissions: [], groups: [] };
        const viewPerm = `wikiView/${ page.actions.wikiView }`;
        return viewPerm === 'wikiView/*' || permsMan.hasPerm(user, viewPerm);
    } // end canView

    canModify(page)
    {
        const user = authMan.account || { permissions: [], groups: [] };
        const viewPerm = `wikiModify/${ page.actions.wikiModify }`;
        return viewPerm === 'wikiModify/*' || permsMan.hasPerm(user, viewPerm);
    } // end canModify
} // end WikiManager

//----------------------------------------------------------------------------------------------------------------------

export default new WikiManager();

//----------------------------------------------------------------------------------------------------------------------
