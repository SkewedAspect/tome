//----------------------------------------------------------------------------------------------------------------------
// WikiResourceAccess.js
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const dbMan = require('../database');

//----------------------------------------------------------------------------------------------------------------------

const db = dbMan.getDB();

//----------------------------------------------------------------------------------------------------------------------

class WikiResourceAccess
{
    getPage(path)
    {
        return db('current_revision')
            .select()
            .where({ path })
            .then((pages) =>
            {
                if(pages.length > 1)
                {
                    return new Error('More than one page returned. This should not be possible.');
                }
                else if(pages.length === 0)
                {
                    return new Error(`No page found for url '${ path }'.`);
                }
                else
                {
                    const page = pages[0];
                    page.created = new Date(page.created);
                    page.edited = new Date(page.edited);

                    return page;
                } // end if
            });
    } // end getPage

    addRevision(page_id, content)
    {
        return db('revision')
            .insert({ content, page_id });
    } // end addRevision
} // end WikiResourceAccess.js

//----------------------------------------------------------------------------------------------------------------------

module.exports = new WikiResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
