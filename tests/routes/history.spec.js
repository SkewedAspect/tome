// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the history module.
//
// @module
// ---------------------------------------------------------------------------------------------------------------------

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

// Setup Logging
process.env.LOG_LEVEL = 'ERROR';

// Setup Database
const dbMan = require('../../server/database');
dbMan.testing = true;

// Setup config
const configMan = require('../../server/managers/config');
configMan.set('overrideAuth', true);
configMan.set('http.port', undefined);

// Managers
const accountMan = require('../../server/managers/account');

// Server
const { app, listen } = require('../../server');

// ---------------------------------------------------------------------------------------------------------------------

let db;

// Start the server
const server = listen();
const request = chai.request(server);
const { expect } = chai;

// ---------------------------------------------------------------------------------------------------------------------

describe("History API ('/history')", () =>
{
    beforeEach(() =>
    {
        return dbMan.getDB()
            .then((testDB) => db = testDB)
            .then(() => accountMan.getAccountByUsername('globalAdmin').then((user) => app.set('user', user)));
    });

    afterEach(() =>
    {
        return dbMan.runSeeds(true);
    });

    describe('GET /history/:path', () =>
    {
        it('returns the entire revision history of the page', () =>
        {
            return request.get('/history/normal')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const page = response.body;
                    expect(page).to.be.an('object');
                    expect(page).to.not.be.empty;

                    expect(page).to.have.property('page_id');
                    expect(page).to.have.property('path', '/normal');
                    expect(page).to.have.property('title', 'Normal Wiki Page');
                    expect(page).to.not.have.property('body');
                    expect(page).to.have.property('created');
                    expect(page).to.have.property('edited');
                    expect(page).to.have.property('revision_id');

                    const revisions = page.revisions;
                    expect(revisions).to.be.an('array');
                    expect(revisions).to.have.length.of(3);

                    const actions = page.actions;
                    expect(actions).to.be.an('object');
                    expect(actions).to.not.be.empty;
                    expect(actions).to.have.property('wikiView', '*');
                    expect(actions).to.have.property('wikiModify', '*');
                });
        });

        it('pages can be hierarchical, separated by `/`', () =>
        {
            return request.get('/history/normal/sub')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const page = response.body;
                    expect(page).to.be.an('object');
                    expect(page).to.not.be.empty;

                    expect(page).to.have.property('page_id');
                    expect(page).to.have.property('path', '/normal/sub');
                    expect(page).to.have.property('title', 'Sub Wiki Page');
                    expect(page).to.not.have.property('body');
                    expect(page).to.have.property('created');
                    expect(page).to.have.property('edited');
                    expect(page).to.have.property('revision_id');

                    const revisions = page.revisions;
                    expect(revisions).to.be.an('array');
                    expect(revisions).to.have.length.of(1);

                    const actions = page.actions;
                    expect(actions).to.be.an('object');
                    expect(actions).to.not.be.empty;
                    expect(actions).to.have.property('wikiView', '*');
                    expect(actions).to.have.property('wikiModify', '*');
                });
        });

        it("requesting a page that doesn't exist returns a 404", () =>
        {
            return request.get('/history/dne')
                .set('Accept', 'application/json')
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(404);
                });
        });

        describe('Permissions', () =>
        {
            it('only returns history for pages that are visible to the user', () =>
            {
                return request.get('/history/normal/sub/perm')
                    .set('Accept', 'application/json')
                    .then((response) =>
                    {
                        expect(response).to.be.json;

                        const page = response.body;
                        expect(page).to.be.an('object');
                        expect(page).to.not.be.empty;

                        expect(page).to.have.property('page_id');
                        expect(page).to.have.property('path', '/normal/sub/perm');
                        expect(page).to.have.property('title', 'Perm Sub Wiki Page');
                        expect(page).to.not.have.property('body');
                        expect(page).to.have.property('created');
                        expect(page).to.have.property('edited');
                        expect(page).to.have.property('revision_id');

                        const revisions = page.revisions;
                        expect(revisions).to.be.an('array');
                        expect(revisions).to.have.length.of(1);

                        const actions = page.actions;
                        expect(actions).to.be.an('object');
                        expect(actions).to.not.be.empty;
                        expect(actions).to.have.property('wikiView', 'special');
                        expect(actions).to.have.property('wikiModify', 'special');
                    })
                    .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.get('/history/normal/sub/perm')
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
                return request.get('/history/normal/sub/perm/inherited')
                    .set('Accept', 'application/json')
                    .then((response) =>
                    {
                        expect(response).to.be.json;

                        const page = response.body;
                        expect(page).to.be.an('object');
                        expect(page).to.not.be.empty;

                        expect(page).to.have.property('page_id');
                        expect(page).to.have.property('path', '/normal/sub/perm/inherited');
                        expect(page).to.have.property('title', 'Inherited Perm Sub Wiki Page');
                        expect(page).to.not.have.property('body');
                        expect(page).to.have.property('created');
                        expect(page).to.have.property('edited');
                        expect(page).to.have.property('revision_id');

                        const revisions = page.revisions;
                        expect(revisions).to.be.an('array');
                        expect(revisions).to.have.length.of(1);

                        const actions = page.actions;
                        expect(actions).to.be.an('object');
                        expect(actions).to.not.be.empty;
                        expect(actions).to.have.property('wikiView', 'special');
                        expect(actions).to.have.property('wikiModify', 'special');
                    })
                    .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.get('/history/normal/sub/perm/inherited')
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
});

// ---------------------------------------------------------------------------------------------------------------------
