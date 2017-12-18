//----------------------------------------------------------------------------------------------------------------------
// WikiResourceAccess
//
// @module
//----------------------------------------------------------------------------------------------------------------------

import _ from 'lodash';
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
} // end WikiResourceAccess

//----------------------------------------------------------------------------------------------------------------------

export default new WikiResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
