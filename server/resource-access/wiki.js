//----------------------------------------------------------------------------------------------------------------------
// WikiResourceAccess.js
//
// @module
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const Promise = require('bluebird');
const dbMan = require('../database');

//----------------------------------------------------------------------------------------------------------------------

const db = dbMan.getDB();

//----------------------------------------------------------------------------------------------------------------------

class WikiResourceAccess
{
    //------------------------------------------------------------------------------------------------------------------
    // Utility Functions
    //------------------------------------------------------------------------------------------------------------------

    _mungeWikiPage(page)
    {
        page.created = new Date(page.created);
        page.edited = new Date(page.edited);

        page.actions = {
            wikiView: page.action_view === 'inherit' ? this._getPermission(page.path, 'view') : page.action_view,
            wikiModify: page.action_modify === 'inherit' ? this._getPermission(page.path, 'modify') : page.action_modify,
        };

        delete page.action_view;
        delete page.action_modify;

        return Promise.props(page.actions)
            .then((actions) =>
            {
                page.actions = actions;
                return page;
            });
    } // end _mungeWikiPage

    _getPermission(path, action)
    {
        return db
            .with('page_ancestors',
                db.raw('select * from page where instr(?, path) order by length(path) desc', [path])
            )
            .from('page_ancestors')
            .distinct()
            .select(`action_${ action } as ${ action }`)
            .whereNot(`action_${ action }`, 'inherit')
            .limit(1)
            .then(([ permObj ]) => permObj[action]);
    } // end _getPermission

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

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
                    return this._mungeWikiPage(pages[0]);
                } // end if
            });
    } // end getPage

    setPageTitle(path, title)
    {
        if(!path)
        {
            throw new Error('Cannot update a wiki page without `path`.');
        } // end if

        return db('page')
            .where({ path: path })
            .update({ title })
            .then((rows) => ({ rowsAffected: rows }));
    } // end setPageTitle

    setPagePermissions(path, action_view, action_modify)
    {
        if(!path)
        {
            throw new Error('Cannot update a wiki page without `path`.');
        } // end if

        return db('page')
            .where({ path: path })
            .update({ action_view, action_modify })
            .then((rows) => ({ rowsAffected: rows }));
    } // end setPagePermissions

    movePage(oldPath, newPath)
    {
        if(!oldPath)
        {
            throw new Error('Cannot update a wiki page without `oldPath`.');
        } // end if

        return db('page')
            .where({ path: oldPath })
            .update({ path: newPath })
            .then((rows) => ({ rowsAffected: rows }));
    } // end movePage

    deletePage(path)
    {
        if(!path)
        {
            throw new Error('Cannot update a wiki page without `path`.');
        } // end if

        return db('page')
            .select('page_id')
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

                    // We will consider `null` as the text for `body` to mean the page was deleted.
                    return this.addRevision(page.page_id, null);
                } // end if
            });
    } // end movePage

    fullDeletePage(path)
    {
        if(!path)
        {
            throw new Error('Cannot delete a wiki page without `path`.');
        } // end if

        // This will delete all revisions and comments.
        return db('page')
            .where({ path })
            .delete()
            .then((rows) => ({ rowsAffected: rows }));
    } //end fullDeletePage

    addRevision(page_id, content)
    {
        if(!page_id)
        {
            throw new Error('Cannot update a wiki page without `page_id`.');
        } // end if

        if(_.isUndefined(content))
        {
            // We coerce `undefined` to empty string, so that `null` can explicitly mean 'I deleted this page.'
            content = '';
        } // end if

        return db('revision')
            .insert({ content, page_id })
            .then(([ id ]) => ({ id }));
    } // end addRevision
} // end WikiResourceAccess.js

//----------------------------------------------------------------------------------------------------------------------

module.exports = new WikiResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
