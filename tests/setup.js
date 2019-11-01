// ---------------------------------------------------------------------------------------------------------------------
// Unit Test Setup
// ---------------------------------------------------------------------------------------------------------------------

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

// Setup config
const configMan = require('../server/api/managers/config');
configMan.set('overrideAuth', true);
configMan.set('http.port', undefined);

// Server
const { app, loading } = require('../server');

// ---------------------------------------------------------------------------------------------------------------------

loading
    .delay(1000)
    .then((server) =>
    {
        const port = server.address().port;

        configMan.set('app', app);
        configMan.set('chaiRequest', chai.request(`http://localhost:${ port }`));
    })
    .then(() =>
    {
        // This is added to the global context by running mocha with `--delay`.
        // See: https://mochajs.org/#delayed-root-suite
        // eslint-disable-next-line no-undef
        run();
    });

// ---------------------------------------------------------------------------------------------------------------------

