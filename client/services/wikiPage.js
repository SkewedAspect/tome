//----------------------------------------------------------------------------------------------------------------------
// WikiPageService
//
// @module
//----------------------------------------------------------------------------------------------------------------------

import _ from 'lodash';
import $http from 'axios';
import Promise from 'bluebird';
import LRU from 'lru-cache';

import BaseService from './base';
import WikiPage from '../models/wikiPage';

//----------------------------------------------------------------------------------------------------------------------

class WikiPageService extends BaseService {
    constructor()
    {
        super();

        this.loading = Promise.resolve();
        this.defineProperty('pageLoading', false);
        this.defineProperty('currentPage');
        this.defineProperty('loadingError');

        this.existsCache = new LRU({ max: 500, maxAge: 5000 });
    } // end constructor

    loadPage(path, force)
    {
        // If we attempt to load the current page, just return the current page. The `force` property will always load
        // a new page.
        if(!force && path === _.get(this.currentPage, 'path'))
        {
            this.existsCache.set(path, true);
            return Promise.resolve(this.currentPage);
        } // end if

        // We reset the loading promise, so we always chain loadPage requests
        return this.loading = this.loading
            .then(() =>
            {
                this.pageLoading = true;
                this.loadingError = undefined;

                return $http.get(`/wiki${ path }`)
                    .then(({ data }) =>
                    {
                        this.currentPage = new WikiPage(data);
                        this.pageLoading = false;
                        this.existsCache.set(path, true);

                        return this.currentPage;
                    })
                    .catch(({ response }) =>
                    {
                        if(response && response.status === 404)
                        {
                            this.currentPage = new WikiPage({ path });
                            this.pageLoading = false;
                            this.existsCache.set(path, false);

                            return this.currentPage;
                        }
                        else
                        {
                            this.loadingError = response;
                            console.error(`Failed to load '/wiki${ path }':`, response);
                        } // end if
                    });
            });
    } // end loadPage

    pageExists(path)
    {
        if(path === this.currentPage.path)
        {
            return Promise.resolve(true);
        }
        else
        {
            if(this.existsCache.has(path))
            {
                return Promise.resolve(this.existsCache.get(path));
            }
            else
            {
                return $http.head(`/wiki${ path }`)
                    .then(() =>
                    {
                        this.existsCache.set(path, true);
                        return true;
                    })
                    .catch(() =>
                    {
                        this.existsCache.set(path, false);
                        return false;
                    });
            } // end if
        } // end if
    } // end pageExists
} // end WikiPageService

//----------------------------------------------------------------------------------------------------------------------

export default new WikiPageService();

//----------------------------------------------------------------------------------------------------------------------
