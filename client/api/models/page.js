//----------------------------------------------------------------------------------------------------------------------
// WikiModel
//
// @module
//----------------------------------------------------------------------------------------------------------------------

import BaseModel from './base';

//----------------------------------------------------------------------------------------------------------------------

class PageModel extends BaseModel
{
    get breadcrumbs(){ return this.$state.path.split('/'); }
} // end WikiModel

//----------------------------------------------------------------------------------------------------------------------

export default PageModel;

//----------------------------------------------------------------------------------------------------------------------
