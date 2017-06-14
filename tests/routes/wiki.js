// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the accounts module.
//
// @module
// ---------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const Promise = require('bluebird');

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

// Modify the config to allow auth overriding.
const config = require('../../config');
config.overrideAuth = true;

const models = require('../../server/models');
const modelMan = require('../model-manager');
const { app, server } = require('../../server');

// ---------------------------------------------------------------------------------------------------------------------

const request = chai.request(server);
const { expect } = chai;

// ---------------------------------------------------------------------------------------------------------------------

describe("Wiki API ('/wiki')", () =>
{
    beforeEach(() =>
    {
        return modelMan.buildModels()
            .then(() =>
            {
                // Set our authentication
                app.set('user', modelMan.get('globalAdmin'));
            });
    });

    afterEach(() =>
    {
        return modelMan.deleteModels();
    });

    describe('GET /wiki/:path', () =>
    {
        it('returns a Page object, with a revision history', () =>
        {
            return request.get('/wiki/normal')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const json = response.body;
                    expect(json).to.be.an('object');
                    expect(json).to.have.property('title', 'Normal Wiki Page');
                    expect(json).to.have.property('path', '/normal');
                    expect(json).to.have.property('revisions');

                    // Revisions
                    const revisions = json.revisions;
                    expect(revisions).to.be.an('array');
                    expect(revisions).to.have.length.of.at.least(1);

                    // Revision
                    const revision = json.revisions[0];
                    expect(revision).to.be.an('object');
                    expect(revision).to.have.property('content');
                    expect(revision).to.have.property('user', modelMan.get('globalAdmin').email);
                });
        });

        it('allows checking for the existence of a page without getting the entire page.', () =>
        {
            return request.head('/wiki/normal')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.have.status(200);

                    // Check for a path that doesn't exist
                    return request.head('/wiki/dne')
                        .set('Accept', 'application/json')
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(404);
                        });
                });
        });

        it('allows a hierarchy of pages, separated by `/`', () =>
        {
            return request.get('/wiki/normal/sub')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const json = response.body;
                    expect(json).to.be.an('object');
                    expect(json).to.have.property('title', 'Sub Wiki Page');
                    expect(json).to.have.property('path', '/normal/sub');
                    expect(json).to.have.property('revisions');
                });
        });

        it('requesting a page that doesn\'t exist returns a 404', () =>
        {
            return request.get('/wiki/dne')
                .set('Accept', 'application/json')
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(404);
                });
        });

        describe('Permissions', () =>
        {
            it('can be made viewable by a specific permission', () =>
            {
                function normalUserTest()
                {
                    const page = modelMan.get('permSubPage');
                    app.set('user', modelMan.get('normalUser'));
                    
                    return request.get(`/wiki${ page.path }`)
                        .set('Accept', 'application/json')
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(403);
                        });
                } // end normalUserTest
                
                function specialUserTest()
                {
                    const page = modelMan.get('permSubPage');
                    app.set('user', modelMan.get('specialUser'));
                    
                    return request.get(`/wiki${ page.path }`)
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.be.json;
        
                            const json = response.body;
                            expect(json).to.be.an('object');
                            expect(json).to.have.property('title', page.title);
                            expect(json).to.have.property('path', page.path);
                            expect(json).to.have.property('revisions');
                        });
                } // end specialUserTest
                
                return normalUserTest().then(() => specialUserTest());    
            });

            it('can inherit their permissions from their parent page', () =>
            {
                function normalUserTest()
                {
                    const page = modelMan.get('inheritedPermSubPage');
                    app.set('user', modelMan.get('normalUser'));
                    
                    return request.get(`/wiki${ page.path }`)
                        .set('Accept', 'application/json')
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(403);
                        });
                } // end normalUserTest
                
                function specialUserTest()
                {
                    const page = modelMan.get('inheritedPermSubPage');
                    app.set('user', modelMan.get('specialUser'));
                    
                    return request.get(`/wiki${ page.path }`)
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.be.json;
        
                            const json = response.body;
                            expect(json).to.be.an('object');
                            expect(json).to.have.property('title', page.title);
                            expect(json).to.have.property('path', page.path);
                            expect(json).to.have.property('revisions');
                        });
                } // end specialUserTest
                
                return normalUserTest().then(() => specialUserTest());    
            });
        });
    });

    describe('PUT /wiki/:path', () =>
    {
        it('users can create new pages', () =>
        {
            const newPage = {
                title: "New Page",
                content: "Welcome to my new page"
            };

            return request.put('/wiki/new-page')
                .set('Accept', 'application/json')
                .send(newPage)
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const page = response.body;
                    expect(page).to.be.an('object');
                    expect(page).to.have.property('title', newPage.title);
                    expect(page).to.have.property('path', '/new-page');
                    expect(page).to.have.property('revisions');

                    // Revisions
                    const revisions = page.revisions;
                    expect(revisions).to.be.an('array');
                    expect(revisions).to.have.length.of(1);

                    // Revision
                    const revision = page.revisions[0];
                    expect(revision).to.be.an('object');
                    expect(revision).to.have.property('content', newPage.content);
                    expect(revision).to.have.property('user', modelMan.get('globalAdmin').email);

                    // Delete the page
                    return models.Page.get(page.id).then((p) => p.delete());
                })
                .catch((error) =>
                {
                    // Delete the page
                    return models.Page.getAll('/new-page', { index: 'path' }).then((pages) =>
                        {
                            return Promise.map(pages, (p) => p.delete());
                        })
                        .then(() =>
                        {
                            throw error;
                        });
                });
        });

        it('anonymous users can not create new pages', () =>
        {
            // Set our authentication
            app.set('user', undefined);

            const newPage = {
                title: "New Page",
                content: "Welcome to my new page"
            };

            return request.put('/wiki/new-page')
                .set('Accept', 'application/json')
                .send(newPage)
                .catch(({ response }) =>
                {
                    expect(response).to.be.json;

                    const json = response.body;
                    expect(json).to.be.an('object');
                    expect(json).to.have.property('name', 'Not Authorized');

                    return response;
                })
                .then((response) =>
                {
                    expect(response).to.have.status(401);
                });
        });

        it('fails to create a new page if one exists', () =>
        {
            const newPage = {
                title: "New Page",
                content: "Welcome to my new page"
            };

            return request.put('/wiki/normal')
                .set('Accept', 'application/json')
                .send(newPage)
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(409);
                });
        });

        describe('Permissions', () =>
        {
            it('allows creation to be restricted to a specific permission on the parent', () =>
            {
                function normalUserTest()
                {
                    app.set('user', modelMan.get('normalUser'));
                    
                    const newPage = {
                        title: "New Page",
                        content: "Welcome to my new page"
                    };
                    
                    return request.put('/wiki/normal/sub/perm/new')
                        .set('Accept', 'application/json')
                        .send(newPage)
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(403);
                        });
                } // end normalUserTest
                
                function specialUserTest()
                {
                    app.set('user', modelMan.get('specialUser'));
                    const user = modelMan.get('specialUser');
                    
                    const newPage = {
                        title: "New Page",
                        content: "Welcome to my new page"
                    };
        
                    return request.put('/wiki/normal/sub/perm/new')
                        .set('Accept', 'application/json')
                        .send(newPage)
                        .then((response) =>
                        {
                            expect(response).to.be.json;
        
                            const page = response.body;
                            expect(page).to.be.an('object');
                            expect(page).to.have.property('title', newPage.title);
                            expect(page).to.have.property('path', '/normal/sub/perm/new');
                            expect(page).to.have.property('revisions');
        
                            // Revisions
                            const revisions = page.revisions;
                            expect(revisions).to.be.an('array');
                            expect(revisions).to.have.length.of(1);
        
                            // Revision
                            const revision = page.revisions[0];
                            expect(revision).to.be.an('object');
                            expect(revision).to.have.property('content', newPage.content);
                            expect(revision).to.have.property('user', user.email);
        
                            // Delete the page
                            return models.Page.get(page.id).then((p) => p.delete());
                        })
                        .catch((error) =>
                        {
                            // Delete the page
                            return models.Page.getAll('/normal/sub/perm/new', { index: 'path' }).then((pages) =>
                                {
                                    return Promise.map(pages, (p) => p.delete());
                                })
                                .then(() =>
                                {
                                    throw error;
                                });
                        });
                } // end specialUserTest
                
                return normalUserTest().then(() => specialUserTest());    
            });

            it('can inherit from grandparent pages', () =>
            {
                function normalUserTest()
                {
                    app.set('user', modelMan.get('normalUser'));
                    
                    const newPage = {
                        title: "New Page",
                        content: "Welcome to my new page"
                    };
                    
                    return request.put('/wiki/normal/sub/perm/inherited/new')
                        .set('Accept', 'application/json')
                        .send(newPage)
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(403);
                        });
                } // end normalUserTest
                
                function specialUserTest()
                {
                    app.set('user', modelMan.get('specialUser'));
                    const user = modelMan.get('specialUser');
                    
                    const newPage = {
                        title: "New Page",
                        content: "Welcome to my new page"
                    };
        
                    return request.put('/wiki/normal/sub/perm/inherited/new')
                        .set('Accept', 'application/json')
                        .send(newPage)
                        .then((response) =>
                        {
                            expect(response).to.be.json;
        
                            const page = response.body;
                            expect(page).to.be.an('object');
                            expect(page).to.have.property('title', newPage.title);
                            expect(page).to.have.property('path', '/normal/sub/perm/inherited/new');
                            expect(page).to.have.property('revisions');
        
                            // Revisions
                            const revisions = page.revisions;
                            expect(revisions).to.be.an('array');
                            expect(revisions).to.have.length.of(1);
        
                            // Revision
                            const revision = page.revisions[0];
                            expect(revision).to.be.an('object');
                            expect(revision).to.have.property('content', newPage.content);
                            expect(revision).to.have.property('user', user.email);
        
                            // Delete the page
                            return models.Page.get(page.id).then((p) => p.delete());
                        })
                        .catch((error) =>
                        {
                            // Delete the page
                            return models.Page.getAll('/wiki/normal/sub/perm/inherited/new', { index: 'path' }).then((pages) =>
                                {
                                    return Promise.map(pages, (p) => p.delete());
                                })
                                .then(() =>
                                {
                                    throw error;
                                });
                        });
                } // end specialUserTest
                
                return normalUserTest().then(() => specialUserTest());    
            });
        });
    });

    describe('POST /wiki/:path', () =>
    {
        it('editing a page generates a new revision', () =>
        {
            const editPage = {
                title: "Normal Page Edit 2",
                content: "Welcome to my new edit...",
                lastRevision: 'rev1'
            };

            return request.post('/wiki/normal')
                .set('Accept', 'application/json')
                .send(editPage)
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const page = response.body;
                    expect(page).to.be.an('object');
                    expect(page).to.have.property('title', editPage.title);
                    expect(page).to.have.property('path', '/normal');
                    expect(page).to.have.property('revisions');

                    // Revisions
                    const revisions = page.revisions;
                    expect(revisions).to.be.an('array');
                    expect(revisions).to.have.length.of(2);

                    // Revision
                    const revision = page.revisions[0];
                    expect(revision).to.be.an('object');
                    expect(revision).to.have.property('content', editPage.content);
                    expect(revision).to.have.property('user', modelMan.get('globalAdmin').email);
                });
        });

        it('refuses an edit if other revisions have been made since', () =>
        {
            const editPage = {
                title: "Normal Page Edit 2",
                content: "Welcome to my new edit...",
                lastRevision: 'dne'
            };

            return request.post('/wiki/normal')
                .set('Accept', 'application/json')
                .send(editPage)
                .catch(({ response }) =>
                {
                    expect(response).to.be.json;

                    const json = response.body;
                    expect(json).to.be.an('object');
                    expect(json).to.have.property('name', 'Last Revision Mismatch');

                    return response;
                })
                .then((response) =>
                {
                    expect(response).to.have.status(409);
                });
        });

        it('editing a page that doesn\'t exist returns a 404', () =>
        {
            const editedPage = {
                path: '/wiki/dne',
                title: "This doesn't exist",
                content: "This should not be!",
                lastRevision: "dne-991212"
            };

            return request.post('/wiki/dne')
                .set('Accept', 'application/json')
                .send(editedPage)
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(404);
                });
        });

        describe('Permissions', () =>
        {
            xit('should do something', () =>
            {
                expect(false).to.equal(true);
            });

            xit('should do something', () =>
            {
                expect(false).to.equal(true);
            });
        });
    });

    describe('DELETE /wiki/:path', () =>
    {
        it('deleting a page completely removes it\'s history', () =>
        {
            return request.delete('/wiki/normal/sub')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;
                    expect(response).to.have.status(200);

                    // Check that the page no longer exists
                    return request.head('/wiki/normal/sub')
                        .set('Accept', 'application/json')
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(404);
                        });
                });
        });

        it('deleting a page that doesn\'t exist returns a 404', () =>
        {
            return request.delete('/wiki/dne')
                .set('Accept', 'application/json')
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(404);
                });
        });

        describe('Permissions', () =>
        {
            xit('should do something', () =>
            {
                expect(false).to.equal(true);
            });

            xit('should do something', () =>
            {
                expect(false).to.equal(true);
            });
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
