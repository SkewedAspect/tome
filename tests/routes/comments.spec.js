// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the wiki module.
// ---------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const { expect } = require('chai');

// Managers
const dbMan = require('../../server/database');
const configMan = require('../../server/api/managers/config');
const accountMan = require('../../server/api/managers/account');

// ---------------------------------------------------------------------------------------------------------------------

let app;
let request;

// ---------------------------------------------------------------------------------------------------------------------

describe("Comment API ('/comment')", () =>
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

    describe('GET /comment/:path', () =>
    {
        it('returns a list of comments on the page', () =>
        {
            return request.get('/comment/normal')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const commentList = response.body;
                    expect(commentList).to.be.an('array');
                    expect(commentList).to.have.length(3);
                    expect(commentList).to.not.be.empty;

                    const comment = commentList[0];
                    expect(comment).to.have.property('comment_id');
                    expect(comment).to.have.property('page_id', 3);
                    expect(comment).to.have.property('path', '/normal');
                    expect(comment).to.have.property('title', 'First Topic');
                    expect(comment).to.have.property('body');
                    expect(comment).to.have.property('created');
                    expect(comment).to.have.property('edited');
                    expect(comment).to.have.property('account_id', 3);
                })
                .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                .then(() =>
                {
                    return request.get('/comment/normal')
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const commentList = response.body;
                            expect(commentList).to.be.an('array');
                            expect(commentList).to.have.length(3);
                            expect(commentList).to.not.be.empty;

                            const comment = commentList[0];
                            expect(comment).to.have.property('comment_id');
                            expect(comment).to.have.property('page_id', 3);
                            expect(comment).to.have.property('title', 'First Topic');
                            expect(comment).to.have.property('body');
                            expect(comment).to.have.property('created');
                            expect(comment).to.have.property('edited');
                            expect(comment).to.have.property('account_id', 3);
                        });
                });
        });

        it("requesting comments for a page that doesn't exist returns a 404", () =>
        {
            return request.get('/comment/dne')
                .set('Accept', 'application/json')
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(404);
                });
        });

        describe('Permissions', () =>
        {
            it('only returns comments for pages that are visible to the user', () =>
            {
                return request.get('/comment/normal/sub/perm')
                    .set('Accept', 'application/json')
                    .then((response) =>
                    {
                        expect(response).to.be.json;

                        const commentList = response.body;
                        expect(commentList).to.be.an('array');
                        expect(commentList).to.have.length(2);
                        expect(commentList).to.not.be.empty;

                        const comment = commentList[0];
                        expect(comment).to.have.property('comment_id');
                        expect(comment).to.have.property('page_id', 5);
                        expect(comment).to.have.property('title', 'Other Topic');
                        expect(comment).to.have.property('body');
                        expect(comment).to.have.property('created');
                        expect(comment).to.have.property('edited');
                        expect(comment).to.have.property('account_id', 5);
                    })
                    .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.get('/comment/normal/sub/perm')
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
                return request.get('/comment/normal/sub/perm/inherited')
                    .set('Accept', 'application/json')
                    .then((response) =>
                    {
                        expect(response).to.be.json;

                        const commentList = response.body;
                        expect(commentList).to.be.an('array');
                        expect(commentList).to.not.be.empty;
                        expect(commentList).to.have.length(2);

                        const comment = commentList[0];
                        expect(comment).to.have.property('comment_id');
                        expect(comment).to.have.property('page_id', 6);
                        expect(comment).to.have.property('title', 'Other Topic');
                        expect(comment).to.have.property('body');
                        expect(comment).to.have.property('created');
                        expect(comment).to.have.property('edited');
                        expect(comment).to.have.property('account_id', 5);
                    })
                    .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                    .then(() =>
                    {
                        return request.get('/comment/normal/sub/perm/inherited')
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

    describe('POST /comment/:path', () =>
    {
        it('logged in users can create new comments', () =>
        {
            const newComment = { title: 'Test Comment', body: 'Sup?' };

            return accountMan.getAccountByUsername('normalUser')
                .then((user) => app.set('user', user))
                .then(() =>
                {
                    return request.post('/comment/normal')
                        .set('Accept', 'application/json')
                        .send(newComment)
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const comment = response.body;
                            expect(comment).to.be.an('object');
                            expect(comment).to.not.be.empty;

                            expect(comment).to.have.property('comment_id');
                            expect(comment).to.have.property('page_id', 3);
                            expect(comment).to.have.property('title', newComment.title);
                            expect(comment).to.have.property('body', newComment.body);
                            expect(comment).to.have.property('created');
                            expect(comment).to.have.property('edited');
                            expect(comment).to.have.property('account_id', 3);

                            // Attempt to look up the page we just created
                            return request.get('/comment/normal')
                                .set('Accept', 'application/json')
                                .then((response) =>
                                {
                                    expect(response).to.be.json;

                                    const commentList = response.body;
                                    expect(commentList).to.be.an('array');
                                    expect(commentList).to.not.be.empty;
                                    expect(commentList).to.have.length(4);

                                    const comment = _.last(commentList);
                                    expect(comment).to.have.property('comment_id');
                                    expect(comment).to.have.property('page_id', 3);
                                    expect(comment).to.have.property('title', newComment.title);
                                    expect(comment).to.have.property('body', newComment.body);
                                    expect(comment).to.have.property('created');
                                    expect(comment).to.have.property('edited');
                                    expect(comment).to.have.property('account_id', 3);
                                });
                        });
                });
        });

        it('anonymous users can not create new comments', () =>
        {
            const newComment = { title: 'Test Comment', body: 'Sup?' };
            app.set('user', null);

            return request.post('/comment/')
                .set('Accept', 'application/json')
                .send(newComment)
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(401);
                });
        });

        describe('Permissions', () =>
        {
            it('only allows creation of comments if the user is allowed to modify the parent page', () =>
            {
                const newComment = { title: 'Test Comment', body: 'Sup?' };
                return accountMan.getAccountByUsername('normalUser')
                    .then((user) => app.set('user', user))
                    .then(() =>
                    {
                        return request.post('/comment/normal/sub/perm')
                            .set('Accept', 'application/json')
                            .send(newComment)
                            .catch(({ response }) => response)
                            .then((response) =>
                            {
                                expect(response).to.have.status(403);
                            })
                            .then(() => accountMan.getAccountByUsername('specialUser').then((user) => app.set('user', user)))
                            .then(() =>
                            {
                                return request.post('/comment/normal/sub/perm')
                                    .set('Accept', 'application/json')
                                    .send(newComment)
                                    .then((response) =>
                                    {
                                        expect(response).to.be.json;

                                        const comment = response.body;
                                        expect(comment).to.be.an('object');
                                        expect(comment).to.not.be.empty;

                                        expect(comment).to.have.property('comment_id');
                                        expect(comment).to.have.property('page_id', 5);
                                        expect(comment).to.have.property('title', newComment.title);
                                        expect(comment).to.have.property('body', newComment.body);
                                        expect(comment).to.have.property('created');
                                        expect(comment).to.have.property('edited');
                                        expect(comment).to.have.property('account_id', 5);

                                        // Attempt to look up the page we just created
                                        return request.get('/comment/normal/sub/perm')
                                            .set('Accept', 'application/json')
                                            .then((response) =>
                                            {
                                                expect(response).to.be.json;

                                                const commentList = response.body;
                                                expect(commentList).to.be.an('array');
                                                expect(commentList).to.not.be.empty;
                                                expect(commentList).to.have.length(3);

                                                const comment = _.last(commentList);
                                                expect(comment).to.have.property('comment_id');
                                                expect(comment).to.have.property('page_id', 5);
                                                expect(comment).to.have.property('title', newComment.title);
                                                expect(comment).to.have.property('body', newComment.body);
                                                expect(comment).to.have.property('created');
                                                expect(comment).to.have.property('edited');
                                                expect(comment).to.have.property('account_id', 5);
                                            });
                                    });
                            });
                    });
            });
        });
    });

    describe('PATCH /comment/:path/:commentID', () =>
    {
        it('allows editing a comment', () =>
        {
            const newEdit = { title: 'Edited Title', body: 'This is an edited page.' };
            return request.patch('/comment/normal/1')
                .set('Accept', 'application/json')
                .send(newEdit)
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const comment = response.body;
                    expect(comment).to.be.an('object');
                    expect(comment).to.not.be.empty;

                    expect(comment).to.have.property('comment_id');
                    expect(comment).to.have.property('page_id', 3);
                    expect(comment).to.have.property('title', newEdit.title);
                    expect(comment).to.have.property('body', newEdit.body);
                    expect(comment).to.have.property('created');
                    expect(comment).to.have.property('edited');
                    expect(comment).to.have.property('account_id', 3);

                    // Attempt to look up the page we just created
                    return request.get('/comment/normal')
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const commentList = response.body;
                            expect(commentList).to.be.an('array');
                            expect(commentList).to.not.be.empty;
                            expect(commentList).to.have.length(3);

                            const comment = commentList[0];
                            expect(comment).to.be.an('object');
                            expect(comment).to.not.be.empty;

                            expect(comment).to.have.property('comment_id');
                            expect(comment).to.have.property('page_id', 3);
                            expect(comment).to.have.property('title', newEdit.title);
                            expect(comment).to.have.property('body', newEdit.body);
                            expect(comment).to.have.property('created');
                            expect(comment).to.have.property('edited');
                            expect(comment).to.have.property('account_id', 3);
                        });
                });
        });

        it('only allows edits if the user is the author, or an admin', () =>
        {
            const newEdit = { title: 'Edited Title', body: 'This is an edited page.' };
            return accountMan.getAccountByUsername('normalUser')
                .then((user) => app.set('user', user))
                .then(() =>
                {
                    return request.patch('/comment/normal/3')
                        .set('Accept', 'application/json')
                        .send(newEdit)
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(403);
                        });
                })
                .then(() => accountMan.getAccountByUsername('groupUser').then((user) => app.set('user', user)))
                .then(() =>
                {
                    return request.patch('/comment/normal/3')
                        .set('Accept', 'application/json')
                        .send(newEdit)
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const comment = response.body;
                            expect(comment).to.be.an('object');
                            expect(comment).to.not.be.empty;

                            expect(comment).to.have.property('comment_id');
                            expect(comment).to.have.property('page_id', 3);
                            expect(comment).to.have.property('title', newEdit.title);
                            expect(comment).to.have.property('body', newEdit.body);
                            expect(comment).to.have.property('created');
                            expect(comment).to.have.property('edited');
                            expect(comment).to.have.property('account_id', 4);
                        });
                })
                .then(() => accountMan.getAccountByUsername('globalAdmin').then((user) => app.set('user', user)))
                .then(() =>
                {
                    return request.patch('/comment/normal/3')
                        .set('Accept', 'application/json')
                        .send(newEdit)
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const comment = response.body;
                            expect(comment).to.be.an('object');
                            expect(comment).to.not.be.empty;

                            expect(comment).to.have.property('comment_id');
                            expect(comment).to.have.property('page_id', 3);
                            expect(comment).to.have.property('title', newEdit.title);
                            expect(comment).to.have.property('body', newEdit.body);
                            expect(comment).to.have.property('created');
                            expect(comment).to.have.property('edited');
                            expect(comment).to.have.property('account_id', 4);
                        });
                });
        });

        it("editing a comment that doesn't exist returns a 404", () =>
        {
            const newEdit = { title: 'Edited Title', body: 'This is an edited page.' };
            return request.patch('/comment/dne/999')
                .set('Accept', 'application/json')
                .send(newEdit)
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(404);
                });
        });

        it("editing a comment on a page that doesn't exist returns a 404", () =>
        {
            const newEdit = { title: 'Edited Title', body: 'This is an edited page.' };
            return request.patch('/comment/dne/3')
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
                const newEdit = { title: 'Edited Title', body: 'This is an edited page.' };
                return accountMan.getAccountByUsername('normalUser')
                    .then((user) => app.set('user', user))
                    .then(() =>
                    {
                        return request.patch('/comment/normal/sub/perm/4')
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
                        return request.patch('/comment/normal/sub/perm/4')
                            .set('Accept', 'application/json')
                            .send(newEdit)
                            .then((response) =>
                            {
                                expect(response).to.be.json;

                                const comment = response.body;
                                expect(comment).to.be.an('object');
                                expect(comment).to.not.be.empty;

                                expect(comment).to.have.property('title', newEdit.title);
                                expect(comment).to.have.property('body', newEdit.body);
                                expect(comment).to.have.property('account_id', 5);
                            });
                    });
            });

            it("inherits the permissions from it's parent page", () =>
            {
                const newEdit = { title: 'Edited Title', body: 'This is an edited page.' };
                return accountMan.getAccountByUsername('normalUser')
                    .then((user) => app.set('user', user))
                    .then(() =>
                    {
                        return request.patch('/comment/normal/sub/perm/inherited/6')
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
                        return request.patch('/comment/normal/sub/perm/inherited/6')
                            .set('Accept', 'application/json')
                            .send(newEdit)
                            .then((response) =>
                            {
                                expect(response).to.be.json;

                                const comment = response.body;
                                expect(comment).to.be.an('object');
                                expect(comment).to.not.be.empty;

                                expect(comment).to.have.property('title', newEdit.title);
                                expect(comment).to.have.property('body', newEdit.body);
                                expect(comment).to.have.property('account_id', 5);
                            });
                    });
            });
        });
    });

    describe('DELETE /comment/:path/:commentID', () =>
    {
        it('deleting a comment removes it completely', () =>
        {
            return request.delete('/comment/normal/1')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    const json = response.body;
                    expect(json).to.have.property('status', 'success');

                    // Attempt to look up the page we just created
                    return request.get('/comment/normal')
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const commentList = response.body;
                            expect(commentList).to.be.an('array');
                            expect(commentList).to.not.be.empty;
                            expect(commentList).to.have.length(2);

                            const comment = commentList[0];
                            expect(comment).to.be.an('object');
                            expect(comment).to.not.be.empty;

                            expect(comment).to.have.property('comment_id');
                            expect(comment).to.have.property('page_id', 3);
                            expect(comment).to.have.property('title', 'Second Topic');
                            expect(comment).to.have.property('body', 'This is a second comment.');
                            expect(comment).to.have.property('created');
                            expect(comment).to.have.property('edited');
                            expect(comment).to.have.property('account_id', 3);
                        });
                });
        });

        it("deleting a comment that doesn't exist returns a 404", () =>
        {
            return request.delete('/comment/normal/999')
                .set('Accept', 'application/json')
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(404);
                });
        });

        it("deleting a comment from a page that doesn't exist returns a 404", () =>
        {
            return request.delete('/comment/dne/1')
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
                        return request.delete('/comment/normal/sub/perm/4')
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
                        return request.delete('/comment/normal/sub/perm/4')
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
                        return request.delete('/comment/normal/sub/perm/inherited/6')
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
                        return request.delete('/comment/normal/sub/perm/inherited/6')
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
