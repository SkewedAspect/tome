//----------------------------------------------------------------------------------------------------------------------
// HistoryResourceAccess
//----------------------------------------------------------------------------------------------------------------------

import _ from 'lodash';
import $http from 'axios';

// Models
import PageHistoryModel from '../models/history';

// Errors
import { AppError } from '../../../server/api/errors';

//----------------------------------------------------------------------------------------------------------------------

class HistoryResourceAccess
{
    _buildModel(def)
    {
        // We just return this, since we aren't caching these objects.
        return new PageHistoryModel(def);
    } // end _buildModel

    getHistory(path)
    {
        return $http.get(`/history${ path }`)
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
            .then((def) => this._buildModel(def));
    } // end getHistory
} // end HistoryResourceAccess

//----------------------------------------------------------------------------------------------------------------------

export default new HistoryResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
