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
        this._currentPageSubject = new BehaviorSubject(undefined);
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Observables
    //------------------------------------------------------------------------------------------------------------------

    get currentPage$() { return this._currentPageSubject.asObservable(); }

    //------------------------------------------------------------------------------------------------------------------
    // Properties
    //------------------------------------------------------------------------------------------------------------------

    get currentPage() { return this._currentPageSubject.getValue(); }

    //------------------------------------------------------------------------------------------------------------------
    // Public
    //------------------------------------------------------------------------------------------------------------------

    createPage(path)
    {
        return wikiRA.createPage(path)
            .then((page) => this._currentPageSubject.next(page));
    } // end createPage

    selectPage(path)
    {
        return wikiRA.getPage(path)
            .tap((page) =>
            {
                this._currentPageSubject.next(page);
            });
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

    movePage(page, newPath)
    {
        return wikiRA.movePage(page, newPath);
    } // end movePage

    deletePage(path)
    {
        return wikiRA.deletePage(path);
    } // end deletePage

    canView(page)
    {
        const user = authMan.account || { permissions: [], groups: [] };
        const viewPerm = `wikiView/${ page.actions.wikiView }`;
        return viewPerm === 'wikiView/*' || permsMan.hasPerm(user, viewPerm);
    } // end canView

    canModify(page)
    {
        const user = authMan.account;
        if(user)
        {
            const viewPerm = `wikiModify/${ page.actions.wikiModify }`;
            return viewPerm === 'wikiModify/*' || permsMan.hasPerm(user, viewPerm);
        } // end if

        return false;
    } // end canModify
} // end WikiManager

//----------------------------------------------------------------------------------------------------------------------

export default new WikiManager();

//----------------------------------------------------------------------------------------------------------------------
