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
import { AppError } from '../../../server/errors';

//----------------------------------------------------------------------------------------------------------------------

class WikiResourceAccess
{
    constructor()
    {
        this.$pages = {};
    } // end constructor

    createPage(path)
    {
        return Promise.resolve(new PageModel({
            path,
            title: undefined,
            body: undefined,
            created: new Date(),
            edited: new Date(),
            actions: { wikiView: '*', wikiModify: '*' }
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
            .then((pageDef) =>
            {
                let pageInst = this.$pages[path];
                if(pageInst)
                {
                    pageInst.update(pageDef);
                }
                else
                {
                    pageInst = new PageModel(pageDef);
                    this.$pages[path] = pageInst;
                } // end if

                return pageInst;
            });
    } // end getPage

    savePage(page)
    {
        const verb = !!page.page_id ? 'patch' : 'post';
        return $http[verb](`/wiki${ page.path }`, page)
            .then(({ data }) =>
            {
                page.update(data);
            });
    } // end savePage
} // end WikiResourceAccess

//----------------------------------------------------------------------------------------------------------------------

export default new WikiResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
