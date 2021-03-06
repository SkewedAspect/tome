//----------------------------------------------------------------------------------------------------------------------
// AccountModel
//----------------------------------------------------------------------------------------------------------------------

import BaseModel from './base';

//----------------------------------------------------------------------------------------------------------------------

class AccountModel extends BaseModel
{
    //------------------------------------------------------------------------------------------------------------------
    // Properties
    //------------------------------------------------------------------------------------------------------------------

    get displayName() { return this.$state.full_name || this.$state.username; }
} // end AccountModel

//----------------------------------------------------------------------------------------------------------------------

export default AccountModel;

//----------------------------------------------------------------------------------------------------------------------
