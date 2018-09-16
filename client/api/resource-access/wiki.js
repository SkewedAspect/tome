//----------------------------------------------------------------------------------------------------------------------
// WikiResourceAccess
//
// @module
//----------------------------------------------------------------------------------------------------------------------

import _ from 'lodash';
import Promise from 'bluebird';
import $http from 'axios';

// Models
import PageModel from '../models/page';

// Errors
import { AppError } from '../../../server/api/errors';

//----------------------------------------------------------------------------------------------------------------------

class WikiResourceAccess
{
    constructor()
    {
        this.$pages = {};
    } // end constructor

    _buildModel(def)
    {
        let pageInst = this.$pages[def.path];
        if(pageInst)
        {
            pageInst.update(def);
        }
        else
        {
            pageInst = new PageModel(def);
            this.$pages[def.path] = pageInst;
        } // end if

        return pageInst;
    } // end _buildModel

    createPage(path)
    {
        return Promise.resolve(new PageModel({
            path,
            title: undefined,
            body: undefined,
            created: new Date(),
            edited: new Date(),
            actions: { wikiView: 'inherit', wikiModify: 'inherit' }
        }));
    } // end createPage

    getPage(path)
    {
        // We always attempt to get the latest version, and update our in-memory model, or make a new one.
        return $http.get(`/wiki${ path }`)
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
            .then((pageDef) => this._buildModel(pageDef));
    } // end getPage

    movePage(page, newPath)
    {
        return $http.put(`/wiki${ page.path }/move`, { path: newPath })
            .then(({ data }) =>
            {
                page.update(data);
            });
    } // end movePage

    savePage(page)
    {
        const verb = !!page.page_id ? 'patch' : 'post';
        return $http[verb](`/wiki${ page.path }`, page)
            .then(({ data }) =>
            {
                page.update(data);
            });
    } // end savePage

    searchPages(term)
    {
        return $http.get('/search', { params: { term } })
            .then(({ data }) => data)
            .map((result) =>
            {
                result.page = this._buildModel(result.page);

                return result;
            });
    } // end searchPages

    deletePage(path)
    {
        return $http.delete(`/wiki${ path }`)
            .then(() =>
            {
                let pageInst = this.$pages[path];
                if(pageInst)
                {
                    delete this.$pages[path];
                } // end if
            });
    } // end deletePage
} // end WikiResourceAccess

//----------------------------------------------------------------------------------------------------------------------

export default new WikiResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
