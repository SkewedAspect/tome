// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the wiki module.
// ---------------------------------------------------------------------------------------------------------------------

const { expect } = require('chai');

// Managers
const dbMan = require('../../server/database');
const configMan = require('../../server/api/managers/config');
const accountMan = require('../../server/api/managers/account');

// ---------------------------------------------------------------------------------------------------------------------

let db;
let app;
let request;

// ---------------------------------------------------------------------------------------------------------------------

describe("Wiki API ('/wiki')", () =>
{
    beforeEach(() =>
    {
        // Setup chai
        request = configMan.get('chaiRequest');

        // Get App
        app = configMan.get('app');

        // Setup db and users
        return dbMan.getDB()
            .then((testDB) => db = testDB)
            .then(() => accountMan.getAccountByUsername('globalAdmin').then((user) => app.set('user', user)));
    });

    afterEach(() =>
    {
        return dbMan.runSeeds(true);
    });

    describe('HEAD /wiki/:path', () =>
    {
        it('the existence of a page can be checked without getting the entire page.', () =>
        {
            return request.head('/wiki')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    const json = response.body;
                    expect(json).to.be.empty;
                });
        });

        it("requesting a page that doesn't exist returns a 404", () =>
        {
            return request.head('/wiki/dne')
                .set('Accept', 'application/json')
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(404);
                });
        });

        describe('Permissions', () =>
        {
            it("requesting a page the user doesn't have permission to view returns a 403", () =>
            {
                return accountMan.getAccountByUsername('normalUser')
                    .then((user) => app.set('user', user))
                    .then(() =>
                    {
                        return request.head('/wiki/perm')
                            .set('Accept', 'application/json')
                            .catch(({ response }) => response)
                            .then((response) =>
                            {
                                expect(response).to.have.status(403);
                            });
                    });
            });
        });
    });

    describe('GET /wiki/:path', () =>
    {
        it('returns the current revision of the page', () =>
        {
            return request.get('/wiki/normal')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.have.status(200);
                    expect(response).to.be.json;

                    const page = response.body;
                    expect(page).to.be.an('object');
                    expect(page).to.not.be.empty;

                    expect(page).to.have.property('page_id');
                    expect(page).to.have.property('path', '/normal');
                    expect(page).to.have.property('title', 'Normal Wiki Page');
                    expect(page).to.have.property('body');
                    expect(page).to.have.property('created');
                    expect(page).to.have.property('edited');
                    expect(page).to.have.property('revision_id');

                    const actions = page.actions;
                    expect(actions).to.be.an('object');
                    expect(actions).to.not.be.empty;
                    expect(actions).to.have.property('wikiView', '*');
                    expect(actions).to.have.property('wikiModify', '*');
                })
                .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                .then(() =>
                {
                    return request.get('/wiki/normal')
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.have.status(200);
                            expect(response).to.be.json;

                            const page = response.body;
                            expect(page).to.be.an('object');
                            expect(page).to.not.be.empty;

                            expect(page).to.have.property('page_id');
                            expect(page).to.have.property('path', '/normal');
                            expect(page).to.have.property('title', 'Normal Wiki Page');
                            expect(page).to.have.property('body');
                            expect(page).to.have.property('created');
                            expect(page).to.have.property('edited');
                            expect(page).to.have.property('revision_id');

                            const actions = page.actions;
                            expect(actions).to.be.an('object');
                            expect(actions).to.not.be.empty;
                            expect(actions).to.have.property('wikiView', '*');
                            expect(actions).to.have.property('wikiModify', '*');
                        });
                });
        });

        it('pages can be hierarchical, separated by `/`', () =>
        {
            return request.get('/wiki/normal/sub')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.have.status(200);
                    expect(response).to.be.json;

                    const page = response.body;
                    expect(page).to.be.an('object');
                    expect(page).to.not.be.empty;

                    expect(page).to.have.property('page_id');
                    expect(page).to.have.property('path', '/normal/sub');
                    expect(page).to.have.property('title', 'Sub Wiki Page');
                    expect(page).to.have.property('body');
                    expect(page).to.have.property('created');
                    expect(page).to.have.property('edited');
                    expect(page).to.have.property('revision_id');

                    const actions = page.actions;
                    expect(actions).to.be.an('object');
                    expect(actions).to.not.be.empty;
                    expect(actions).to.have.property('wikiView', '*');
                    expect(actions).to.have.property('wikiModify', '*');
                })
                .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                .then(() =>
                {
                    return request.get('/wiki/normal/sub')
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.have.status(200);
                            expect(response).to.be.json;

                            const page = response.body;
                            expect(page).to.be.an('object');
                            expect(page).to.not.be.empty;

                            expect(page).to.have.property('page_id');
                            expect(page).to.have.property('path', '/normal/sub');
                            expect(page).to.have.property('title', 'Sub Wiki Page');
                            expect(page).to.have.property('body');
                            expect(page).to.have.property('created');
                            expect(page).to.have.property('edited');
                            expect(page).to.have.property('revision_id');

                            const actions = page.actions;
                            expect(actions).to.be.an('object');
                            expect(actions).to.not.be.empty;
                            expect(actions).to.have.property('wikiView', '*');
                            expect(actions).to.have.property('wikiModify', '*');
                        });
                });
        });

        it("requesting a page that doesn't exist returns a 404", () =>
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
            it('only returns pages that are visible to the user', () =>
            {
                return request.get('/wiki/normal/sub/perm')
                    .set('Accept', 'application/json')
                    .then((response) =>
                    {
                        expect(response).to.have.status(200);
                        expect(response).to.be.json;

                        const page = response.body;
                        expect(page).to.be.an('object');
                        expect(page).to.not.be.empty;

                        expect(page).to.have.property('page_id');
                        expect(page).to.have.property('path', '/normal/sub/perm');
                        expect(page).to.have.property('title', 'Perm Sub Wiki Page');
                        expect(page).to.have.property('body');
                        expect(page).to.have.property('created');
                        expect(page).to.have.property('edited');
                        expect(page).to.have.property('revision_id');

                        const actions = page.actions;
                        expect(actions).to.be.an('object');
                        expect(actions).to.not.be.empty;
                        expect(actions).to.have.property('wikiView', 'special');
                        expect(actions).to.have.property('wikiModify', 'special');
                    })
                    .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.get('/wiki/normal/sub/perm')
                            .set('Accept', 'application/json')
                            .catch(({ response }) => response)
                            .then((response) =>
                            {
                                expect(response).to.have.status(403);
                            });
                    });
            });

            it("inherits the permissions from it's parent page", () =>
            {
                return request.get('/wiki/normal/sub/perm/inherited')
                    .set('Accept', 'application/json')
                    .then((response) =>
                    {
                        expect(response).to.have.status(200);
                        expect(response).to.be.json;

                        const page = response.body;
                        expect(page).to.be.an('object');
                        expect(page).to.not.be.empty;

                        expect(page).to.have.property('page_id');
                        expect(page).to.have.property('path', '/normal/sub/perm/inherited');
                        expect(page).to.have.property('title', 'Inherited Perm Sub Wiki Page');
                        expect(page).to.have.property('body');
                        expect(page).to.have.property('created');
                        expect(page).to.have.property('edited');
                        expect(page).to.have.property('revision_id');

                        const actions = page.actions;
                        expect(actions).to.be.an('object');
                        expect(actions).to.not.be.empty;
                        expect(actions).to.have.property('wikiView', 'special');
                        expect(actions).to.have.property('wikiModify', 'special');
                    })
                    .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.get('/wiki/normal/sub/perm/inherited')
                            .set('Accept', 'application/json')
                            .catch(({ response }) => response)
                            .then((response) =>
                            {
                                expect(response).to.have.status(403);
                            });
                    });
            });
        });
    });

    describe('OPTIONS /wiki/:path', () =>
    {
        it('gives the inherited permissions for any path', () =>
        {
            return request.options('/wiki/normal/sub/perm/inherited')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    const perms = response.body;
                    expect(perms).to.be.an('object');
                    expect(perms).to.not.be.empty;

                    expect(perms).to.have.property('actions');

                    const actions = perms.actions;
                    expect(actions).to.not.be.empty;
                    expect(actions).to.have.property('wikiView', 'special');
                    expect(actions).to.have.property('wikiModify', 'special');
                })
                .then(() =>
                {
                    return request.options('/wiki/normal/sub/perm/does-not-exist')
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            const perms = response.body;
                            expect(perms).to.be.an('object');
                            expect(perms).to.not.be.empty;

                            expect(perms).to.have.property('actions');

                            const actions = perms.actions;
                            expect(actions).to.not.be.empty;
                            expect(actions).to.have.property('wikiView', 'special');
                            expect(actions).to.have.property('wikiModify', 'special');
                        });
                });
        });

        it('can be called by unauthenticated users', () =>
        {
            app.set('user', null);

            return request.options('/wiki/normal/sub/perm/inherited')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    const perms = response.body;
                    expect(perms).to.be.an('object');
                    expect(perms).to.not.be.empty;

                    expect(perms).to.have.property('actions');

                    const actions = perms.actions;
                    expect(actions).to.not.be.empty;
                    expect(actions).to.have.property('wikiView', 'special');
                    expect(actions).to.have.property('wikiModify', 'special');
                })
                .then(() =>
                {
                    return request.options('/wiki/normal/sub/perm/does-not-exist')
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            const perms = response.body;
                            expect(perms).to.be.an('object');
                            expect(perms).to.not.be.empty;

                            expect(perms).to.have.property('actions');

                            const actions = perms.actions;
                            expect(actions).to.not.be.empty;
                            expect(actions).to.have.property('wikiView', 'special');
                            expect(actions).to.have.property('wikiModify', 'special');
                        });
                });
        });
    });

    describe('POST /wiki/:path', () =>
    {
        it('logged in users can create new pages', () =>
        {
            const newPage = { path: '/bar', title: 'Bar Page', body: 'The bar page.' };

            return accountMan.getAccountByUsername('normalUser')
                .then((user) => app.set('user', user))
                .then(() =>
                {
                    return request.post('/wiki/bar')
                        .set('Accept', 'application/json')
                        .send(newPage)
                        .then((response) =>
                        {
                            expect(response).to.have.status(200);
                            expect(response).to.be.json;

                            const page = response.body;
                            expect(page).to.be.an('object');
                            expect(page).to.not.be.empty;

                            expect(page).to.have.property('page_id');
                            expect(page).to.have.property('path', '/bar');
                            expect(page).to.have.property('title', 'Bar Page');
                            expect(page).to.have.property('body');
                            expect(page).to.have.property('created');
                            expect(page).to.have.property('edited');
                            expect(page).to.have.property('revision_id');

                            const actions = page.actions;
                            expect(actions).to.be.an('object');
                            expect(actions).to.not.be.empty;
                            expect(actions).to.have.property('wikiView', '*');
                            expect(actions).to.have.property('wikiModify', '*');

                            // Attempt to look up the page we just created
                            return request.get('/wiki/bar')
                                .set('Accept', 'application/json')
                                .then((response) =>
                                {
                                    expect(response).to.have.status(200);
                                    expect(response).to.be.json;

                                    const page = response.body;
                                    expect(page).to.be.an('object');
                                    expect(page).to.not.be.empty;

                                    expect(page).to.have.property('page_id');
                                    expect(page).to.have.property('path', '/bar');
                                    expect(page).to.have.property('title', 'Bar Page');
                                    expect(page).to.have.property('body');
                                    expect(page).to.have.property('created');
                                    expect(page).to.have.property('edited');
                                    expect(page).to.have.property('revision_id');

                                    const actions = page.actions;
                                    expect(actions).to.be.an('object');
                                    expect(actions).to.not.be.empty;
                                    expect(actions).to.have.property('wikiView', '*');
                                    expect(actions).to.have.property('wikiModify', '*');
                                });
                        });
                });
        });

        it('anonymous users can not create new pages', () =>
        {
            const newPage = { path: '/bar', title: 'Bar Page', body: 'The bar page.' };
            app.set('user', null);

            return request.post('/wiki/bar')
                .set('Accept', 'application/json')
                .send(newPage)
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(401);
                });
        });

        it('fails to create a new page if one exists', () =>
        {
            const newPage = { path: '/normal', title: 'Bar Page', body: 'The bar page.' };

            return request.post('/wiki/normal')
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
            it('only allows creation of pages if the user is allowed to modify the parent page', () =>
            {
                const newPage = { path: '/normal/sub/perm/bar', title: 'Bar Page', body: 'The bar page.' };

                return accountMan.getAccountByUsername('normalUser')
                    .then((user) => app.set('user', user))
                    .then(() =>
                    {
                        return request.post('/wiki/normal/sub/perm/bar')
                            .set('Accept', 'application/json')
                            .send(newPage)
                            .catch(({ response }) => response)
                            .then((response) => 
                            {
                                expect(response).to.have.status(403);
                            })
                            .then(() => accountMan.getAccountByUsername('specialUser').then((user) => app.set('user', user)))
                            .then(() =>
                            {
                                return request.post('/wiki/normal/sub/perm/bar')
                                    .set('Accept', 'application/json')
                                    .send(newPage)
                                    .then((response) =>
                                    {
                                        expect(response).to.have.status(200);
                                        expect(response).to.be.json;

                                        const page = response.body;
                                        expect(page).to.be.an('object');
                                        expect(page).to.not.be.empty;

                                        expect(page).to.have.property('page_id');
                                        expect(page).to.have.property('path', '/normal/sub/perm/bar');
                                        expect(page).to.have.property('title', 'Bar Page');
                                        expect(page).to.have.property('body');
                                        expect(page).to.have.property('created');
                                        expect(page).to.have.property('edited');
                                        expect(page).to.have.property('revision_id');

                                        const actions = page.actions;
                                        expect(actions).to.be.an('object');
                                        expect(actions).to.not.be.empty;
                                        expect(actions).to.have.property('wikiView', 'special');
                                        expect(actions).to.have.property('wikiModify', 'special');

                                        // Attempt to look up the page we just created
                                        return request.get('/wiki/normal/sub/perm/bar')
                                            .set('Accept', 'application/json')
                                            .then((response) =>
                                            {
                                                expect(response).to.have.status(200);
                                                expect(response).to.be.json;

                                                const page = response.body;
                                                expect(page).to.be.an('object');
                                                expect(page).to.not.be.empty;

                                                expect(page).to.have.property('page_id');
                                                expect(page).to.have.property('path', '/normal/sub/perm/bar');
                                                expect(page).to.have.property('title', 'Bar Page');
                                                expect(page).to.have.property('body');
                                                expect(page).to.have.property('created');
                                                expect(page).to.have.property('edited');
                                                expect(page).to.have.property('revision_id');

                                                const actions = page.actions;
                                                expect(actions).to.be.an('object');
                                                expect(actions).to.not.be.empty;
                                                expect(actions).to.have.property('wikiView', 'special');
                                                expect(actions).to.have.property('wikiModify', 'special');
                                            });
                                    });
                            });
                    });
            });

            it('allows the page to be created with non-default permissions', () =>
            {
                const newPage = {
                    path: '/perm-test',
                    title: 'Perm Test Page',
                    body: 'The bar page.',
                    action_view: 'special',
                    action_modify: 'special'
                };

                return request.post('/wiki/perm-test')
                    .set('Accept', 'application/json')
                    .send(newPage)
                    .then((response) =>
                    {
                        expect(response).to.have.status(200);
                        expect(response).to.be.json;

                        const page = response.body;
                        expect(page).to.be.an('object');
                        expect(page).to.not.be.empty;

                        expect(page).to.have.property('page_id');
                        expect(page).to.have.property('path', '/perm-test');
                        expect(page).to.have.property('title', 'Perm Test Page');
                        expect(page).to.have.property('body');
                        expect(page).to.have.property('created');
                        expect(page).to.have.property('edited');
                        expect(page).to.have.property('revision_id');

                        const actions = page.actions;
                        expect(actions).to.be.an('object');
                        expect(actions).to.not.be.empty;
                        expect(actions).to.have.property('wikiView', 'special');
                        expect(actions).to.have.property('wikiModify', 'special');

                        // Attempt to look up the page we just created
                        return request.get('/wiki/perm-test')
                            .set('Accept', 'application/json')
                            .then((response) =>
                            {
                                expect(response).to.have.status(200);
                                expect(response).to.be.json;

                                const page = response.body;
                                expect(page).to.be.an('object');
                                expect(page).to.not.be.empty;

                                expect(page).to.have.property('page_id');
                                expect(page).to.have.property('path', '/perm-test');
                                expect(page).to.have.property('title', 'Perm Test Page');
                                expect(page).to.have.property('body');
                                expect(page).to.have.property('created');
                                expect(page).to.have.property('edited');
                                expect(page).to.have.property('revision_id');

                                const actions = page.actions;
                                expect(actions).to.be.an('object');
                                expect(actions).to.not.be.empty;
                                expect(actions).to.have.property('wikiView', 'special');
                                expect(actions).to.have.property('wikiModify', 'special');
                            });
                    })
                    .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.get('/wiki/perm-test')
                            .set('Accept', 'application/json')
                            .send(newPage)
                            .catch(({ response }) => response)
                            .then((response) =>
                            {
                                expect(response).to.have.status(403);
                            });
                    });
            });

            it("a user cannot create a page that they can't view", () =>
            {
                const newPage = {
                    path: '/perm-test',
                    title: 'Perm Test Page',
                    body: 'The bar page.',
                    action_view: 'special',
                    action_modify: 'special'
                };

                return accountMan.getAccountByUsername('normalUser')
                    .then((user) => app.set('user', user))
                    .then(() =>
                    {
                        return request.post('/wiki/perm-test')
                            .set('Accept', 'application/json')
                            .send(newPage)
                            .catch(({ response }) => response)
                            .then((response) =>
                            {
                                expect(response).to.have.status(403);
                            });
                    });
            });
        });
    });

    describe('PUT /wiki/:path/move', () =>
    {
        it('passing in a valid path moves the page', () =>
        {
            const newPath = { path: '/normal/moved' };
            return request.put('/wiki/normal/move')
                .set('Accept', 'application/json')
                .send(newPath)
                .then((response) =>
                {
                    expect(response).to.have.status(200);
                    expect(response).to.be.json;

                    const page = response.body;
                    expect(page).to.be.an('object');
                    expect(page).to.not.be.empty;

                    expect(page).to.have.property('page_id');
                    expect(page).to.have.property('title');
                    expect(page).to.have.property('body');
                    expect(page).to.have.property('path', newPath.path);

                    // Attempt to look up the page we just created
                    return request.get('/wiki/normal/moved')
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.have.status(200);
                            expect(response).to.be.json;

                            const movedPage = response.body;
                            expect(movedPage).to.be.an('object');
                            expect(movedPage).to.not.be.empty;

                            expect(movedPage).to.have.property('page_id', page.page_id);
                            expect(movedPage).to.have.property('title', page.title);
                            expect(movedPage).to.have.property('body', page.body);
                            expect(movedPage).to.have.property('path', newPath.path);
                            expect(movedPage).to.have.property('revision_id', page.revision_id);
                        });
                })
                .then(() =>
                {
                    return request.head('/wiki/normal')
                        .set('Accept', 'application/json')
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(404);
                        });
                });
        });

        it('does not allow you to move a page to an existing path', () =>
        {
            const newPath = { path: '/normal/sub' };
            return request.put('/wiki/normal/move')
                .set('Accept', 'application/json')
                .send(newPath)
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.be.json;
                    expect(response).to.have.status(409);

                    const error = response.body;
                    expect(error).to.be.an('object');
                    expect(error).to.not.be.empty;
                    expect(error).to.have.property('code', 'ERR_PAGE_EXISTS');
                });
        });

        it("move is refused for pages that don't exist", () =>
        {
            const newPath = { path: '/normal/moved' };
            return request.put('/wiki/dne/move')
                .set('Accept', 'application/json')
                .send(newPath)
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.be.json;
                    expect(response).to.have.status(404);

                    const error = response.body;
                    expect(error).to.be.an('object');
                    expect(error).to.not.be.empty;
                    expect(error).to.have.property('code', 'ERR_NOT_FOUND');
                });
        });

        it('move is refused for deleted pages', () =>
        {
            const newPath = { path: '/normal/moved' };
            return request.put('/wiki/deleted/move')
                .set('Accept', 'application/json')
                .send(newPath)
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.be.json;
                    expect(response).to.have.status(404);

                    const error = response.body;
                    expect(error).to.be.an('object');
                    expect(error).to.not.be.empty;
                    expect(error).to.have.property('code', 'ERR_NOT_FOUND');
                });
        });

        describe('Permissions', () =>
        {
            it('only allows move if the user has the appropriate permission', () =>
            {
                const newPath = { path: '/normal/moved' };
                return accountMan.getAccountByUsername('normalUser')
                    .then((user) => app.set('user', user))
                    .then(() =>
                    {
                        return request.put('/wiki/normal/sub/perm/move')
                            .set('Accept', 'application/json')
                            .send(newPath)
                            .catch(({ response }) => response)
                            .then((response) =>
                            {
                                expect(response).to.have.status(403);
                            });
                    })
                    .then(() => accountMan.getAccountByUsername('specialUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.put('/wiki/normal/sub/perm/move')
                            .set('Accept', 'application/json')
                            .send(newPath)
                            .then((response) =>
                            {
                                expect(response).to.have.status(200);
                                expect(response).to.be.json;

                                const movedPage = response.body;
                                expect(movedPage).to.be.an('object');
                                expect(movedPage).to.not.be.empty;

                                expect(movedPage).to.have.property('page_id');
                                expect(movedPage).to.have.property('title');
                                expect(movedPage).to.have.property('body');
                                expect(movedPage).to.have.property('path', newPath.path);
                                expect(movedPage).to.have.property('revision_id');
                            });
                    });
            });

            it("inherits the permissions from it's parent page", () =>
            {
                const newPath = { path: '/normal/moved' };
                return accountMan.getAccountByUsername('normalUser')
                    .then((user) => app.set('user', user))
                    .then(() =>
                    {
                        return request.put('/wiki/normal/sub/perm/inherited/move')
                            .set('Accept', 'application/json')
                            .send(newPath)
                            .catch(({ response }) => response)
                            .then((response) =>
                            {
                                expect(response).to.have.status(403);
                            });
                    })
                    .then(() => accountMan.getAccountByUsername('specialUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.put('/wiki/normal/sub/perm/inherited/move')
                            .set('Accept', 'application/json')
                            .send(newPath)
                            .then((response) =>
                            {
                                expect(response).to.have.status(200);
                                expect(response).to.be.json;

                                const movedPage = response.body;
                                expect(movedPage).to.be.an('object');
                                expect(movedPage).to.not.be.empty;

                                expect(movedPage).to.have.property('page_id');
                                expect(movedPage).to.have.property('title');
                                expect(movedPage).to.have.property('body');
                                expect(movedPage).to.have.property('path', newPath.path);
                                expect(movedPage).to.have.property('revision_id');
                            });
                    });
            });
        });
    });

    describe('PATCH /wiki/:path', () =>
    {
        it('editing a page generates a new revision', () =>
        {
            const newEdit = { title: 'Edited Title', body: 'This is an edited page.' };
            return request.get('/wiki/normal')
                .set('Accept', 'application/json')
                .then((data) =>
                {
                    const page = data.body;

                    // We need to save the current revision number to save this correctly.
                    newEdit.revision_id = page.revision_id;

                    return request.patch('/wiki/normal')
                        .set('Accept', 'application/json')
                        .send(newEdit)
                        .then((response) =>
                        {
                            expect(response).to.have.status(200);
                            expect(response).to.be.json;

                            const page = response.body;
                            expect(page).to.be.an('object');
                            expect(page).to.not.be.empty;

                            expect(page).to.have.property('page_id');
                            expect(page).to.have.property('title', newEdit.title);
                            expect(page).to.have.property('body', newEdit.body);
                            expect(page).to.have.property('revision_id');
                            expect(page).to.not.have.property('revision_id', newEdit.revision_id);

                            // Attempt to look up the page we just created
                            return request.get('/wiki/normal')
                                .set('Accept', 'application/json')
                                .then((response) =>
                                {
                                    expect(response).to.have.status(200);
                                    expect(response).to.be.json;

                                    const page = response.body;
                                    expect(page).to.be.an('object');
                                    expect(page).to.not.be.empty;

                                    expect(page).to.have.property('page_id');
                                    expect(page).to.have.property('title', newEdit.title);
                                    expect(page).to.have.property('body', newEdit.body);
                                    expect(page).to.have.property('revision_id');
                                    expect(page).to.not.have.property('revision_id', newEdit.revision_id);
                                });
                        });
                });
        });

        it('edits are refused if other edits have happened since this edit was started', () =>
        {
            const newEdit = { title: 'Edited Title', body: 'This is an edited page.', revision_id: 1 };
            return request.patch('/wiki/normal')
                .set('Accept', 'application/json')
                .send(newEdit)
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(409);
                });
        });

        it("editing a page that doesn't exist returns a 404", () =>
        {
            const newEdit = { title: 'Edited Title', body: 'This is an edited page.', revision_id: 1 };
            return request.patch('/wiki/dne')
                .set('Accept', 'application/json')
                .send(newEdit)
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(404);
                });
        });

        describe('Permissions', () =>
        {
            it('only allows edits if the user has the appropriate permission', () =>
            {
                const newEdit = { title: 'Edited Title', body: 'This is an edited page.', revision_id: 1 };
                return accountMan.getAccountByUsername('normalUser')
                    .then((user) => app.set('user', user))
                    .then(() =>
                    {
                        return request.patch('/wiki/perm')
                            .set('Accept', 'application/json')
                            .send(newEdit)
                            .catch(({ response }) => response)
                            .then((response) =>
                            {
                                expect(response).to.have.status(403);
                            });
                    })
                    .then(() => accountMan.getAccountByUsername('specialUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.get('/wiki/perm')
                            .set('Accept', 'application/json')
                            .then((data) =>
                            {
                                const page = data.body;

                                // We need to save the current revision number to save this correctly.
                                newEdit.revision_id = page.revision_id;

                                return request.patch('/wiki/perm')
                                    .set('Accept', 'application/json')
                                    .send(newEdit)
                                    .then((response) =>
                                    {
                                        expect(response).to.have.status(200);
                                        expect(response).to.be.json;

                                        const page = response.body;
                                        expect(page).to.be.an('object');
                                        expect(page).to.not.be.empty;

                                        expect(page).to.have.property('title', newEdit.title);
                                        expect(page).to.have.property('body', newEdit.body);
                                        expect(page).to.not.have.property('revision_id', newEdit.revision_id);
                                    });
                            });
                    });
            });

            it("inherits the permissions from it's parent page", () =>
            {
                const newEdit = { title: 'Edited Title', body: 'This is an edited page.', revision_id: 1 };
                return accountMan.getAccountByUsername('normalUser')
                    .then((user) => app.set('user', user))
                    .then(() =>
                    {
                        return request.patch('/wiki/normal/sub/perm/inherited')
                            .set('Accept', 'application/json')
                            .send(newEdit)
                            .catch(({ response }) => response)
                            .then((response) =>
                            {
                                expect(response).to.have.status(403);
                            });
                    })
                    .then(() => accountMan.getAccountByUsername('specialUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.get('/wiki/normal/sub/perm/inherited')
                            .set('Accept', 'application/json')
                            .then((data) =>
                            {
                                const page = data.body;

                                // We need to save the current revision number to save this correctly.
                                newEdit.revision_id = page.revision_id;

                                return request.patch('/wiki/normal/sub/perm/inherited')
                                    .set('Accept', 'application/json')
                                    .send(newEdit)
                                    .then((response) =>
                                    {
                                        expect(response).to.have.status(200);
                                        expect(response).to.be.json;

                                        const page = response.body;
                                        expect(page).to.be.an('object');
                                        expect(page).to.not.be.empty;

                                        expect(page).to.have.property('title', newEdit.title);
                                        expect(page).to.have.property('body', newEdit.body);
                                        expect(page).to.not.have.property('revision_id', newEdit.revision_id);
                                    });
                            });
                    });
            });

            it('allows the page to be updated with permissions', () =>
            {
                const editPage = {
                    title: 'Edited Title',
                    body: 'This is an edited page.',
                    action_view: 'special',
                    action_modify: 'special'
                };

                return request.get('/wiki/normal')
                    .set('Accept', 'application/json')
                    .then((data) =>
                    {
                        const page = data.body;

                        // We need to save the current revision number to save this correctly.
                        editPage.revision_id = page.revision_id;

                        return request.patch('/wiki/normal')
                            .set('Accept', 'application/json')
                            .send(editPage)
                            .then((response) =>
                            {
                                expect(response).to.have.status(200);
                                expect(response).to.be.json;

                                const page = response.body;
                                expect(page).to.be.an('object');
                                expect(page).to.not.be.empty;

                                expect(page).to.have.property('page_id');
                                expect(page).to.have.property('path', '/normal');
                                expect(page).to.have.property('title', 'Edited Title');
                                expect(page).to.have.property('body');
                                expect(page).to.have.property('created');
                                expect(page).to.have.property('edited');
                                expect(page).to.have.property('revision_id');

                                const actions = page.actions;
                                expect(actions).to.be.an('object');
                                expect(actions).to.not.be.empty;
                                expect(actions).to.have.property('wikiView', 'special');
                                expect(actions).to.have.property('wikiModify', 'special');

                                // Attempt to look up the page we just created
                                return request.get('/wiki/normal')
                                    .set('Accept', 'application/json')
                                    .then((response) =>
                                    {
                                        expect(response).to.have.status(200);
                                        expect(response).to.be.json;

                                        const page = response.body;
                                        expect(page).to.be.an('object');
                                        expect(page).to.not.be.empty;

                                        expect(page).to.have.property('page_id');
                                        expect(page).to.have.property('path', '/normal');
                                        expect(page).to.have.property('title', 'Edited Title');
                                        expect(page).to.have.property('body');
                                        expect(page).to.have.property('created');
                                        expect(page).to.have.property('edited');
                                        expect(page).to.have.property('revision_id');

                                        const actions = page.actions;
                                        expect(actions).to.be.an('object');
                                        expect(actions).to.not.be.empty;
                                        expect(actions).to.have.property('wikiView', 'special');
                                        expect(actions).to.have.property('wikiModify', 'special');
                                    });
                            })
                            .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                            .then(() =>
                            {
                                return request.get('/wiki/normal')
                                    .set('Accept', 'application/json')
                                    .send(editPage)
                                    .catch(({ response }) => response)
                                    .then((response) =>
                                    {
                                        expect(response).to.have.status(403);
                                    });
                            });
                    });
            });

            it("a user cannot create a page that they can't view", () =>
            {
                const editPage = {
                    title: 'Edited Title',
                    body: 'This is an edited page.',
                    action_view: 'special',
                    action_modify: 'special'
                };

                return request.get('/wiki/normal')
                    .set('Accept', 'application/json')
                    .then((data) =>
                    {
                        const page = data.body;

                        // We need to save the current revision number to save this correctly.
                        editPage.revision_id = page.revision_id;

                        return accountMan.getAccountByUsername('normalUser')
                            .then((user) => app.set('user', user))
                            .then(() =>
                            {
                                return request.patch('/wiki/normal')
                                    .set('Accept', 'application/json')
                                    .send(editPage)
                                    .catch(({ response }) => response)
                                    .then((response) =>
                                    {
                                        expect(response).to.have.status(403);
                                    });
                            });
                    });
            });
        });
    });

    describe('DELETE /wiki/:path', () =>
    {
        it('deleting a page adds an empty revision', () =>
        {
            return request.delete('/wiki/normal')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    const json = response.body;
                    expect(json).to.have.property('status', 'success');

                    return db('current_revision')
                        .select()
                        .where({ path: '/normal' })
                        .then(([ row ]) =>
                        {
                            expect(row).to.have.property('body', null);
                        });
                });
        });

        it('getting a deleted page returns a 404', () =>
        {
            return request.delete('/wiki/normal')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    const json = response.body;
                    expect(json).to.have.property('status', 'success');

                    return request.get('/wiki/normal')
                        .set('Accept', 'application/json')
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(404);
                        });
                });
        });

        it("deleting a page that doesn't exist returns a 404", () =>
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
            it('only allows deletes if the user has the appropriate permission for editing', () =>
            {
                return accountMan.getAccountByUsername('normalUser')
                    .then((user) => app.set('user', user))
                    .then(() =>
                    {
                        return request.delete('/wiki/perm')
                            .set('Accept', 'application/json')
                            .catch(({ response }) => response)
                            .then((response) =>
                            {
                                expect(response).to.have.status(403);
                            });
                    })
                    .then(() => accountMan.getAccountByUsername('specialUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.delete('/wiki/perm')
                            .set('Accept', 'application/json')
                            .then((response) =>
                            {
                                const json = response.body;
                                expect(json).to.have.property('status', 'success');
                            });
                    });
            });

            it("inherits the permissions from it's parent page", () =>
            {
                return accountMan.getAccountByUsername('normalUser')
                    .then((user) => app.set('user', user))
                    .then(() =>
                    {
                        return request.delete('/wiki/normal/sub/perm/inherited')
                            .set('Accept', 'application/json')
                            .catch(({ response }) => response)
                            .then((response) =>
                            {
                                expect(response).to.have.status(403);
                            });
                    })
                    .then(() => accountMan.getAccountByUsername('specialUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.delete('/wiki/normal/sub/perm/inherited')
                            .set('Accept', 'application/json')
                            .then((response) =>
                            {
                                const json = response.body;
                                expect(json).to.have.property('status', 'success');
                            });
                    });
            });
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
