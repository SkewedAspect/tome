//----------------------------------------------------------------------------------------------------------------------
// BaseService
//
// @module
//----------------------------------------------------------------------------------------------------------------------

import Vue from 'vue';
import stateSvc from './state';

//----------------------------------------------------------------------------------------------------------------------

class BaseService {
    defineProperty(propName, defaultVal)
    {
        stateSvc.state[propName] = defaultVal;

        Object.defineProperty(this, propName, {
            get: function(){ return stateSvc.state[propName]; },
            set: function(val){ Vue.set(stateSvc.state, propName, val); }
        });
    } // end defineProperty
} // end BaseService

//----------------------------------------------------------------------------------------------------------------------

export default BaseService;

//----------------------------------------------------------------------------------------------------------------------
