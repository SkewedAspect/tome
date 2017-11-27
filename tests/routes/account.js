// ---------------------------------------------------------------------------------------------------------------------
// Unit Tests for the account module.
//
// @module
// ---------------------------------------------------------------------------------------------------------------------

const Promise = require('bluebird');

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

describe("Account API ('/account')", () =>
{
    beforeEach(() =>
    {
        return dbMan.getDB()
            .then((testDB) => db = testDB)
            .then(() => accountMan.getAccountByUsername('globalAdmin').then((user) => app.set('user', user)));
    });

    afterEach(() =>
    {
        // Clear the database between runs
        return db.seed.run();
    });

    describe("GET '/account'", () =>
    {
        it('gets a list of all accounts, with a limited set of information', () =>
        {
            return accountMan.getAccountByUsername('normalUser')
                .then((user) => app.set('user', user))
                .then(() =>
                {
                    return request.get('/account')
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const json = response.body;
                            expect(json).to.be.a('array');
                            expect(json).to.have.length.of(5);

                            const admin = json[0];
                            expect(admin.email).to.equal('fake-admin@test.com');
                            expect(admin.google_id).to.be.undefined;
                            expect(admin.permissions).to.be.undefined;
                            expect(admin.settings).to.be.undefined;
                        });
                })
                .then((user) => app.set('user', null))
                .then(() =>
                {
                    return request.get('/account')
                        .set('Accept', 'application/json')
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(401);
                        });
                });
        });

        it('gets a list of all accounts, with full information, if admin', () =>
        {
            return request.get('/account')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const json = response.body;
                    expect(json).to.be.a('array');
                    expect(json).to.have.length.of(5);

                    const admin = json[0];
                    expect(admin.email).to.equal('fake-admin@test.com');
                    expect(admin.google_id).to.be.null;
                    expect(admin.permissions).to.deep.equal([ '*/*' ]);
                    expect(admin.settings).to.deep.equal({});
                });
        });
    });

    describe("GET '/account/:accountID'", () =>
    {
        it('gets an account, with a limited set of information', () =>
        {
            return accountMan.getAccountByUsername('normalUser')
                .then((user) => app.set('user', user))
                .then(() =>
                {
                    return request.get('/account/1')
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            const admin = response.body;
                            expect(admin.email).to.equal('fake-admin@test.com');
                            expect(admin.google_id).to.be.undefined;
                            expect(admin.permissions).to.be.undefined;
                            expect(admin.settings).to.be.undefined;
                        });
                });
        });

        it('gets an account, with full information, if admin', () =>
        {
            return request.get('/account/1')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    const admin = response.body;
                    expect(admin.email).to.equal('fake-admin@test.com');
                    expect(admin.google_id).to.be.null;
                    expect(admin.permissions).to.deep.equal([ '*/*' ]);
                    expect(admin.settings).to.deep.equal({});
                });
        });
    });

    describe("POST '/account'", () =>
    {
        it('creates a new account, if admin', () =>
        {
            const newAccount = { username: 'normalUser2', email: 'normal-user2@test.com' };

            // We attempt to post as an admin, this should work
            return request.post('/account')
                .set('Accept', 'application/json')
                .send(newAccount)
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const account = response.body;
                    expect(account).to.be.an('object');
                    expect(account).to.have.property('username', newAccount.username);
                    expect(account).to.have.property('email', newAccount.email);

                    // Attempt to look up the account we just created by id
                    return request.get(`/account/${ account.account_id }`)
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const account = response.body;
                            expect(account).to.be.an('object');
                            expect(account).to.have.property('username', newAccount.username);
                        });
                })
                .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                .then(() =>
                {
                    // Attempt to create a new user as a normal user. This shouldn't work.
                    return request.post('/account')
                        .set('Accept', 'application/json')
                        .send(newAccount)
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(403);
                        });
                })
                .then(() => app.set('user', null))
                .then(() =>
                {
                    // Attempt to create a new user while not being logged in. This shouldn't work.
                    return request.post('/account')
                        .set('Accept', 'application/json')
                        .send(newAccount)
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(401);
                        });
                });
        });

        it('does not allow duplicate email or username', () =>
        {
            const newAccount = { username: 'normalUser', email: 'normal-user2@test.com' };

            // Attempt to create a user with a duplicate email. This should not work.
            return request.post('/account')
                .set('Accept', 'application/json')
                .send(newAccount)
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(409);
                })
                .then(() =>
                {
                    const newAccount = { username: 'normalUser2', email: 'normal-user@test.com' };

                    // Attempt to create a user with a duplicate username. This should not work.
                    return request.post('/account')
                        .set('Accept', 'application/json')
                        .send(newAccount)
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(409);
                        });
                });
        });
    });

    describe("PATCH '/account/:accountID'", () =>
    {
        it('can change basic info if admin or same account', () =>
        {
            const accountUpdate = { full_name: 'Normal User', email: 'normie@test.com' };

            // We attempt to update as an admin, this should work
            return request.patch('/account/3')
                .set('Accept', 'application/json')
                .send(accountUpdate)
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const account = response.body;
                    expect(account).to.be.an('object');
                    expect(account).to.have.property('full_name', accountUpdate.full_name);
                    expect(account).to.have.property('email', accountUpdate.email);

                    // Verify that the changes went through.
                    return request.get(`/account/3`)
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const account = response.body;
                            expect(account).to.be.an('object');
                            expect(account).to.have.property('full_name', accountUpdate.full_name);
                            expect(account).to.have.property('email', accountUpdate.email);
                        });
                })
                .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                .then(() =>
                {
                    const accountUpdate2 = { full_name: 'Joe Normal', email: 'joe.normie@test.com' };

                    // We attempt to update as the same user, this should work
                    return request.patch('/account/3')
                        .set('Accept', 'application/json')
                        .send(accountUpdate2)
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const account = response.body;
                            expect(account).to.be.an('object');
                            expect(account).to.have.property('full_name', accountUpdate2.full_name);
                            expect(account).to.have.property('email', accountUpdate2.email);

                            // Verify that the changes went through.
                            return request.get(`/account/3`)
                                .set('Accept', 'application/json')
                                .then((response) =>
                                {
                                    expect(response).to.be.json;

                                    const account = response.body;
                                    expect(account).to.be.an('object');
                                    expect(account).to.have.property('full_name', accountUpdate2.full_name);
                                    expect(account).to.have.property('email', accountUpdate2.email);
                                });
                        });
                })
                .then(() =>
                {
                    const accountUpdate2 = { full_name: 'Joe Normal', email: 'joe.normie@test.com' };

                    // We attempt to update as a different user, this should not work
                    return request.patch('/account/4')
                        .set('Accept', 'application/json')
                        .send(accountUpdate2)
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(403);
                        });
                });
        });

        it('can change permissions, if admin', () =>
        {
            const accountUpdate = { permissions: [ 'foo/bar' ] };

            // We attempt to update as an admin, this should work
            return request.patch('/account/3')
                .set('Accept', 'application/json')
                .send(accountUpdate)
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const account = response.body;
                    expect(account).to.be.an('object');
                    expect(account.permissions).to.deep.equal(accountUpdate.permissions);

                    // Verify that the changes went through.
                    return request.get(`/account/3`)
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const account = response.body;
                            expect(account).to.be.an('object');
                            expect(account.permissions).to.deep.equal(accountUpdate.permissions);
                        });
                })
                .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                .then(() =>
                {
                    const accountUpdate2 = { permissions: [ 'foo/bar2' ] };

                    // We attempt to update as a normal user, this should not work
                    return request.patch('/account/3')
                        .set('Accept', 'application/json')
                        .send(accountUpdate2)
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const account = response.body;
                            expect(account).to.be.an('object');
                            expect(account.permissions).to.deep.equal(accountUpdate.permissions);

                        });
                });
        });

        it('can set `google_id` if not set, and same account', () =>
        {
            return accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user))
                .then(() =>
                {
                    const accountUpdate = { google_id: '12345' };

                    // We attempt to update as the same user, this should work
                    return request.patch('/account/3')
                        .set('Accept', 'application/json')
                        .send(accountUpdate)
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const account = response.body;
                            expect(account).to.be.an('object');
                            expect(account).to.have.property('google_id', '12345');

                            // Verify that the changes went through.
                            return request.get(`/account/3`)
                                .set('Accept', 'application/json')
                                .then((response) =>
                                {
                                    expect(response).to.be.json;

                                    const account = response.body;
                                    expect(account).to.be.an('object');
                                    expect(account).to.have.property('google_id', '12345');
                                });
                        });
                })
                .then(() =>
                {
                    const accountUpdate = { google_id: '54321' };

                    // We attempt to update again, now that it's set, and this shouldn't work.
                    return request.patch('/account/3')
                        .set('Accept', 'application/json')
                        .send(accountUpdate)
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const account = response.body;
                            expect(account).to.be.an('object');
                            expect(account).to.have.property('google_id', '12345');
                        });
                });
        });

        it('can set `google_id` even if set, if admin', () =>
        {
            const accountUpdate = { google_id: '12345' };

            // We attempt to update as the same user, this should work
            return request.patch('/account/3')
                .set('Accept', 'application/json')
                .send(accountUpdate)
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const account = response.body;
                    expect(account).to.be.an('object');
                    expect(account).to.have.property('google_id', '12345');

                    // Verify that the changes went through.
                    return request.get(`/account/3`)
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const account = response.body;
                            expect(account).to.be.an('object');
                            expect(account).to.have.property('google_id', '12345');
                        });
                })
                .then(() =>
                {
                    const accountUpdate = { google_id: '54321' };

                    // We attempt to update again, now that it's set, and this shouldn't work.
                    return request.patch('/account/3')
                        .set('Accept', 'application/json')
                        .send(accountUpdate)
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const account = response.body;
                            expect(account).to.be.an('object');
                            expect(account).to.have.property('google_id', '12345');
                        });
                });
        });

        it('can change settings, if admin or same account', () =>
        {
            const accountUpdate = { settings: { showEmail: true, otherSetting: 'apples' } };

            // We attempt to update as an admin, this should work
            return request.patch('/account/3')
                .set('Accept', 'application/json')
                .send(accountUpdate)
                .then((response) =>
                {
                    expect(response).to.be.json;

                    const account = response.body;
                    expect(account).to.be.an('object');

                    const settings = account.settings;
                    expect(settings).to.be.an('object');
                    expect(settings).to.have.property('showEmail', true);
                    expect(settings).to.have.property('otherSetting', 'apples');

                    // Verify that the changes went through.
                    return request.get(`/account/3`)
                        .set('Accept', 'application/json')
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const account = response.body;
                            expect(account).to.be.an('object');

                            const settings = account.settings;
                            expect(settings).to.be.an('object');
                            expect(settings).to.have.property('showEmail', true);
                            expect(settings).to.have.property('otherSetting', 'apples');
                        });
                })
                .then(() => accountMan.getAccountByUsername('normalUser').then((user) => app.set('user', user)))
                .then(() =>
                {
                    const accountUpdate2 = { settings: { showEmail: false, otherSetting2: 'bears' } };

                    // We attempt to update as the same user, this should work
                    return request.patch('/account/3')
                        .set('Accept', 'application/json')
                        .send(accountUpdate2)
                        .then((response) =>
                        {
                            expect(response).to.be.json;

                            const account = response.body;
                            expect(account).to.be.an('object');

                            const settings = account.settings;
                            expect(settings).to.be.an('object');
                            expect(settings).to.have.property('showEmail', false);
                            expect(settings).to.have.property('otherSetting', 'apples');
                            expect(settings).to.have.property('otherSetting2', 'bears');

                            // Verify that the changes went through.
                            return request.get(`/account/3`)
                                .set('Accept', 'application/json')
                                .then((response) =>
                                {
                                    expect(response).to.be.json;

                                    const account = response.body;
                                    expect(account).to.be.an('object');

                                    const settings = account.settings;
                                    expect(settings).to.be.an('object');
                                    expect(settings).to.have.property('showEmail', false);
                                    expect(settings).to.have.property('otherSetting', 'apples');
                                    expect(settings).to.have.property('otherSetting2', 'bears');
                                });
                        });
                })
                .then(() =>
                {
                    const accountUpdate2 = { settings: { foo: 'bar' } };

                    // We attempt to update as a different user, this should not work
                    return request.patch('/account/4')
                        .set('Accept', 'application/json')
                        .send(accountUpdate2)
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(403);
                        });
                });
        });
    });

    describe("DELETE '/account/:accountID'", () =>
    {
        it('deletes an account, if admin', () =>
        {
            return request.delete('/account/3')
                .set('Accept', 'application/json')
                .then((response) =>
                {
                    expect(response).to.be.json;
                    expect(response).to.have.status(200);

                    // Check that the page no longer exists
                    return request.get('/account/3')
                        .set('Accept', 'application/json')
                        .catch(({ response }) => response)
                        .then((response) =>
                        {
                            expect(response).to.have.status(404);
                        });
                });
        });

        it("returns a 404 if the account doesn't exist", () =>
        {
            return request.delete('/account/99')
                .set('Accept', 'application/json')
                .catch(({ response }) => response)
                .then((response) =>
                {
                    expect(response).to.have.status(404);
                });
        });
    });
});

// ---------------------------------------------------------------------------------------------------------------------
