//----------------------------------------------------------------------------------------------------------------------
// WikiResourceAccess.js
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const Promise = require('bluebird');

const dbMan = require('../../database');
const { AppError, NotFoundError, MultipleResultsError, ValidationError } = require('../errors');

//----------------------------------------------------------------------------------------------------------------------

/* eslint-disable camelcase */

class WikiResourceAccess
{
    constructor()
    {
        this.loading = dbMan.getDB();
    } // end constructor

    //------------------------------------------------------------------------------------------------------------------
    // Utility Functions
    //------------------------------------------------------------------------------------------------------------------

    _mungeWikiPage(page)
    {
        page.created = Date.parse(`${ page.created } GMT`);
        page.edited = Date.parse(`${ page.edited } GMT`);

        page.actions = {
            wikiView: page.action_view === 'inherit' ? this._getPermission(page.path, 'view') : page.action_view,
            wikiModify: page.action_modify === 'inherit' ? this._getPermission(page.path, 'modify') : page.action_modify
        };

        // delete page.action_view;
        // delete page.action_modify;

        return Promise.props(page.actions)
            .then((actions) =>
            {
                page.actions = actions;
                return page;
            });
    } // end _mungeWikiPage

    _getPermission(path, action)
    {
        return this.loading
            .then((db) => db
                .with(
                    'page_ancestors',
                    db.raw('select * from page where instr(?, path) order by length(path) desc', [ path ])
                )
                .from('page_ancestors')
                .distinct()
                .select(`action_${ action } as ${ action }`)
                .whereNot(`action_${ action }`, 'inherit')
                .orderBy('path', 'desc')
                .limit(1)
                .then(([ permObj ]) => permObj[action]));
    } // end _getPermission

    //------------------------------------------------------------------------------------------------------------------
    // Public API
    //------------------------------------------------------------------------------------------------------------------

    createPage(page)
    {
        page.action_view = _.get(page, 'action_view', 'inherit');
        page.action_modify = _.get(page, 'action_modify', 'inherit');

        return this.loading
            .then((db) => db.transaction((trans) =>
            {
                db('page')
                    .transacting(trans)
                    .insert(_.pick(page, 'title', 'path', 'action_view', 'action_modify'))
                    .then(([ newPageID ]) =>
                    {
                        return db('revision')
                            .transacting(trans)
                            .insert({ page_id: newPageID, body: page.body });
                    })
                    .then(trans.commit)
                    .catch((error) =>
                    {
                        console.error(`Failed to create page '${ page.path }':`, error.stack);

                        // Throw a generic error, because we want the outside code to know this didn't work,
                        // but we don't want to expose the details.
                        const newError = new AppError(`Failed to create page '${ page.path }'.`);

                        // Rollback the transaction
                        return trans.rollback(newError);
                    });
            }));
    } // end createPage

    getPage(path)
    {
        return this.loading
            .then((db) => db('current_revision')
                .select()
                .where({ path })
                .then((pages) =>
                {
                    if(pages.length > 1)
                    {
                        throw new MultipleResultsError('page');
                    }
                    else if(pages.length === 0)
                    {
                        throw new NotFoundError(`No page found for url '${ path }'.`);
                    }
                    else
                    {
                        return this._mungeWikiPage(pages[0]);
                    } // end if
                }));
    } // end getPage

    getPageByID(page_id)
    {
        return this.loading
            .then((db) => db('current_revision')
                .select()
                .where({ page_id })
                .then((pages) =>
                {
                    if(pages.length > 1)
                    {
                        throw new MultipleResultsError('page');
                    }
                    else if(pages.length === 0)
                    {
                        throw new NotFoundError(`No page found for id '${ page_id }'.`);
                    }
                    else
                    {
                        return this._mungeWikiPage(pages[0]);
                    } // end if
                }));
    } // end getPageByID

    getPageHistory(path)
    {
        return this.loading
            .then((db) => db('page')
                .innerJoin('revision', 'page.page_id', '=', 'revision.page_id')
                .where({ path })
                .orderBy('edited', 'desc')
                .then((pages) =>
                {
                    if(pages.length > 0)
                    {
                        const page = _.omit(pages[0], 'body');
                        const revisions = _.reduce(pages, (revs, page) =>
                        {
                            page.created = new Date(page.created);
                            page.edited = new Date(page.edited);

                            revs.push(_.pick(page, 'revision_id', 'body', 'edited'));
                            return revs;
                        }, []);

                        page.revisions = revisions;
                        page.created = _.last(revisions).edited;

                        return this._mungeWikiPage(page);
                    }
                    else
                    {
                        throw new NotFoundError(`No page found for url '${ path }'.`);
                    } // end if
                }));
    } // end getPageHistory

    getRecentPageRevisions(max = 25)
    {
        return this.loading
            .then((db) =>
            {
                let query = db('page')
                    .select(
                        'page.title as title',
                        'page.path as path',
                        'revision.revision_id as revision_id',
                        'revision.page_id as page_id',
                        'revision.edited as edited',
                        db.raw('RANK () OVER '
                            + '( PARTITION BY revision.page_id ORDER BY revision.edited ASC ) revision_num ')
                    )
                    .innerJoin('revision', 'page.page_id', '=', 'revision.page_id')
                    .orderBy('edited', 'desc');
                if(max)
                {
                    query = query.limit(max);
                } // end if

                return query.then((pages) =>
                {
                    return pages.map((page) =>
                    {
                        return {
                            ...page,
                            edited: Date.parse(`${ page.edited } GMT`)
                        };
                    });
                });
            });
    } // end getRecentPageRevisions

    getPermission(path, action)
    {
        return this._getPermission(path, action);
    } // end getPermission

    searchPages(term)
    {
        return this.loading
            .then((db) => db('page_search')
                .select('rowid as page_id')
                .select(db.raw(`snippet(page_search, 0, '<span class="fts-match">', '</span>', '...', 3) title`))
                .select(db.raw(`snippet(page_search, 1, '<span class="fts-match">', '</span>', '...', 5) body`))
                .where(db.raw('page_search MATCH ?', term))
                .orderBy('rank'))
            .map(({ page_id, title, body }) =>
            {
                return this.getPageByID(page_id)
                    .then((page) =>
                    {
                        return {
                            match: { title, body },
                            page
                        };
                    });
            });
    } // end searchPages

    updatePage(newPage)
    {
        newPage.action_view = _.get(newPage, 'action_view', 'inherit');
        newPage.action_modify = _.get(newPage, 'action_modify', 'inherit');

        return this.loading
            .then((db) => db('current_revision')
                .select('page_id', 'path', 'title', 'revision_id')
                .where({ page_id: newPage.page_id })
                .then(([ currentPage ]) =>
                {
                    if(!currentPage)
                    {
                        throw new NotFoundError(`No page found for id '${ newPage.page_id }'.`);
                    }
                    else if(newPage.path !== currentPage.path)
                    {
                        throw new ValidationError('path', "Updating 'path' must be done as it's own operation.");
                    }
                    else
                    {
                        return db.transaction((trans) =>
                        {
                            let pageQuery = Promise.resolve();
                            const newPageObj = _.pick(newPage, 'title', 'action_view', 'action_modify');

                            if(!_.isEmpty(newPageObj))
                            {
                                pageQuery = db('page')
                                    .transacting(trans)
                                    .update(newPageObj)
                                    .where({ page_id: currentPage.page_id });
                            } // end if

                            // We don't return, or else it auto-commits.
                            pageQuery
                                .then(() =>
                                {
                                    if(newPage.body && currentPage.body !== newPage.body)
                                    {
                                        if(!_.isUndefined(newPage.revision_id) && currentPage.revision_id !== newPage.revision_id)
                                        {
                                            throw new ValidationError(
                                                'revision_id',
                                                "this revision is not the current 'revision_id'. Your chances may be against an outdated version."
                                            );
                                        }
                                        else
                                        {
                                            return this.addRevision(newPage.page_id, newPage.body, trans);
                                        } // end if
                                    } // end if
                                })
                                .then(trans.commit)
                                .catch((error) =>
                                {
                                    console.error(`Failed to update page '${ newPage.path }':`, error.stack);

                                    // Throw a generic error, because we want the outside code to know this didn't work,
                                    // but we don't want to expose the details.
                                    const newError = new AppError(`Failed to update page '${ newPage.path }'.`);

                                    // Rollback the transaction
                                    return trans.rollback(newError);
                                });
                        });
                    } // end if
                }));
    } // end updatePage

    movePage(oldPath, newPath)
    {
        return Promise.join(
            this.getPage(oldPath).catch({ code: 'ERR_NOT_FOUND' }, () => null),
            this.getPage(newPath).catch({ code: 'ERR_NOT_FOUND' }, () => null)
        )
            .then(([ oldPage, newPage ]) =>
            {
                if(newPage)
                {
                    throw new ValidationError('path', 'Cannot move page to a path with an existing page.');
                } // end if

                if(!oldPage || oldPage.body === null)
                {
                    throw new NotFoundError(`No page found for url '${ oldPath }'.`);
                } // end if

                return this.loading
                    .then((db) => db('page')
                        .where({ path: oldPath })
                        .update({ path: newPath })
                        .then((rows) => ({ rowsAffected: rows })));
            });
    } // end movePage

    deletePage(path)
    {
        return this.loading
            .then((db) => db('page')
                .select('page_id')
                .where({ path })
                .then((pages) =>
                {
                    if(pages.length > 1)
                    {
                        throw new MultipleResultsError('page');
                    }
                    else if(pages.length === 0)
                    {
                        throw new NotFoundError(`No page found for url '${ path }'.`);
                    }
                    else
                    {
                        const page = pages[0];

                        // We will consider `null` as the text for `body` to mean the page was deleted.
                        return this.addRevision(page.page_id, null);
                    } // end if
                }));
    } // end movePage

    fullDeletePage(path)
    {
        // This will delete all revisions and comments.
        return this.loading
            .then((db) => db('page')
                .where({ path })
                .delete()
                .then((rows) => ({ rowsAffected: rows })));
    } // end fullDeletePage

    addRevision(page_id, body, transObj)
    {
        if(_.isUndefined(body))
        {
            // We coerce `undefined` to empty string, so that `null` can explicitly mean 'I deleted this page.'
            body = '';
        } // end if

        return this.loading
            .then((db) =>
            {
                const query = db('revision');

                if(transObj)
                {
                    query.transacting(transObj);
                } // end if

                return query
                    .insert({ body, page_id })
                    .then(([ id ]) => ({ id }));
            });
    } // end addRevision
} // end WikiResourceAccess.js

//----------------------------------------------------------------------------------------------------------------------

module.exports = new WikiResourceAccess();

//----------------------------------------------------------------------------------------------------------------------
