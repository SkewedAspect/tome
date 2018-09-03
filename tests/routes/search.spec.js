// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for searching wiki pages
// ---------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
let { expect } = require('chai');

// Managers
const dbMan = require('../../server/database');
const configMan = require('../../server/api/managers/config');
const accountMan = require('../../server/api/managers/account');

// ---------------------------------------------------------------------------------------------------------------------

let db;
let app;
let request;

// ---------------------------------------------------------------------------------------------------------------------

describe("Search API ('/search')", () =>
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

    describe('GET /search?term={query}', () =>
    {
        it('returns a list of pages that match', () =>
        {
            return request.get('/search?term=page')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const results = response.body;
                    expect(results).to.be.an('array');
                    expect(results).to.have.lengthOf(7);

                    const first = _.first(results);
                    expect(first).to.have.nested.property('match.title', 'Home');
                    expect(first).to.have.nested.property('match.body', 'Home <span class="fts-match">page</span>.');

                    expect(first).to.have.property('page');
                    expect(first).to.have.nested.property('page.page_id', 1);
                });
        });

        it('does not return deleted pages', () =>
        {
            return request.get('/search?term=deleted')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const results = response.body;
                    expect(results).to.be.an('array');
                    expect(results).to.have.lengthOf(1);

                    const first = _.first(results);
                    expect(first).to.have.nested.property('match.title', 'Not <span class="fts-match">Deleted</span> Wiki Page');
                    expect(first).to.have.nested.property('match.body', 'This is a _normal_ wiki...');

                    expect(first).to.have.property('page');
                    expect(first).to.have.nested.property('page.page_id', 8);
                });
        });

        describe('Permissions', () =>
        {
            it('only returns pages that are visible to the user', () =>
            {
                return request.get('/search?term=sub')
                    .set('Accept', 'application/json')
                    .then((response) =>
                    {
                        expect(response).to.be.json;

                        const results = response.body;
                        expect(results).to.be.an('array');
                        expect(results).to.have.lengthOf(4);
                    })
                    .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.get('/search?term=sub')
                            .set('Accept', 'application/json')
                            .then((response) =>
                            {
                                expect(response).to.be.json;

                                const results = response.body;
                                expect(results).to.be.an('array');
                                expect(results).to.have.lengthOf(2);
                            });
                    });
            });
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
