//----------------------------------------------------------------------------------------------------------------------
// WikiPage
//
// @module
//----------------------------------------------------------------------------------------------------------------------

import _ from 'lodash';
import Vue from 'vue';

//----------------------------------------------------------------------------------------------------------------------

class WikiPage
{
    constructor(pageModel)
    {
        // This represents the currently saved page in the database
        // We default it so that we have all of our properties present when Vue gets ahold of it.
        this._saved = _.defaultsDeep({}, pageModel, {
            id: undefined,
            title: undefined,
            path: undefined,
            revisions: [],
            actions: {
                create: 'inherit',
                view: 'inherit',
                update: 'inherit',
                delete: 'inherit',
                comment: 'inherit'
            },
            created: undefined
        });

        // This is the 'live, unsaved' version
        this._live = _.cloneDeep(this._saved);
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Properties
    //------------------------------------------------------------------------------------------------------------------

    get live(){ return this._live; }

    get id(){ return this._saved.id; }
    get title(){ return this._saved.title; }
    get path(){ return this._saved.path; }
    get revisions(){ return this._saved.revisions; }
    get actions(){ return this._saved.actions; }
    get created(){ return this._saved.created; }

    get currentRevision(){ return this._saved.revisions[0]; }

    //------------------------------------------------------------------------------------------------------------------
    // Functions
    //------------------------------------------------------------------------------------------------------------------

    revert()
    {
        Vue.set(this, '_live', _.cloneDeep(this._saved));
    } // end revert

} // end WikiPage

//----------------------------------------------------------------------------------------------------------------------

export default WikiPage;

//----------------------------------------------------------------------------------------------------------------------
