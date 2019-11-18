// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the recent module.
// ---------------------------------------------------------------------------------------------------------------------

const { expect } = require('chai');

// Managers
const dbMan = require('../../server/database');
const configMan = require('../../server/api/managers/config');
const accountMan = require('../../server/api/managers/account');

// ---------------------------------------------------------------------------------------------------------------------

let app;
let request;

// ---------------------------------------------------------------------------------------------------------------------

describe("Recent API ('/recent')", () =>
{
    beforeEach(() =>
    {
        // Setup chai
        request = configMan.get('chaiRequest');

        // Get App
        app = configMan.get('app');

        // Setup db and users
        return dbMan.getDB()
            .then(() => accountMan.getAccountByUsername('globalAdmin').then((user) => app.set('user', user)));
    });

    afterEach(() =>
    {
        return dbMan.runSeeds(true);
    });

    describe('GET /recent/comments', () =>
    {
        it('returns the default number of recent comments', () =>
        {
            return request.get('/recent/comments')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const commentList = response.body;
                    expect(commentList).to.be.an('array');
                    expect(commentList).to.have.length(7);

                    const comment = commentList[0];

                    expect(comment).to.have.property('comment_id');
                    expect(comment).to.have.property('title');
                    expect(comment).to.have.property('page_id');
                    expect(comment).to.have.property('page_path');
                    expect(comment).to.have.property('page_title');
                    expect(comment).to.have.property('body');
                    expect(comment).to.have.property('username');
                    expect(comment).to.have.property('created');
                    expect(comment).to.have.property('edited');
                    expect(comment).to.have.property('account_id');
                });
        });

        it('returns the specified number of comments', () =>
        {
            return request.get('/recent/comments?max=5')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const commentList = response.body;
                    expect(commentList).to.be.an('array');
                    expect(commentList).to.have.length(5);
                });
        });
    });

    describe('GET /recent/wiki', () =>
    {
        it('returns the default number of recent revisions', () =>
        {
            return request.get('/recent/wiki')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const pages = response.body;
                    expect(pages).to.be.an('array');
                    expect(pages).to.have.lengthOf(12);

                    const page = pages[0];
                    expect(page).to.be.an('object');
                    expect(page).to.have.property('page_id');
                    expect(page).to.have.property('path');
                    expect(page).to.have.property('title');
                    expect(page).to.have.property('edited');
                    expect(page).to.have.property('revision_id');
                });
        });

        it('returns the specified number of revisions', () =>
        {
            return request.get('/recent/wiki?max=5')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const pages = response.body;
                    expect(pages).to.be.an('array');
                    expect(pages).to.have.lengthOf(5);
                });
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
