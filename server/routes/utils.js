//----------------------------------------------------------------------------------------------------------------------
// Express routing utils
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');

//----------------------------------------------------------------------------------------------------------------------

const indexErrorPage = `<html>
    <head>
        <title>Error</title>
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body style="background-color: #333">
        <div class="card m-5">
            <div class="card-body">
                <h1 class="text-center text-danger">Error serving index.html</h1>
                <p class="text-center text-muted">
                    Something unexpected happened. Please try again later.
                </p>
            </div>
        </div>
    </body>
</html>`;

//----------------------------------------------------------------------------------------------------------------------

// Basic request logging
function buildBasicRequestLogger(logger)
{
    return function(request, response, next)
    {
        logger.debug(`${ request.method } '${ request.url }'`);
        next();
    }; // end loggerFunc
} // end buildBasicRequestLogger

// Basic error logging
function buildBasicErrorLogger(logger)
{
    return function(error, request, response, next)
    {
        logger.child({
            request: {
                id: request.id,
                method: request.method,
                url: request.url,
                body: request.body,
                query: request.query
            }
        }).error(`${ request.method } ${ response.statusCode } '${ request.url }': Error encountered: \n${ error.stack }`, error);

        next(error);
    }; // end loggerFunc
} // end buildBasicErrorLogger

// Serve index
function serveIndex(request, response)
{
    response.setHeader('Content-Type', 'text/html');

    const stream = fs.createReadStream(path.resolve(`${ __dirname }/../../` + `dist/index.html`));
    stream.on('error', (error) =>
    {
        console.warn('Error serving index.html:', error.stack);
        response.status(500)
            .end(indexErrorPage);
    });

    // Pipe out the response
    stream.pipe(response);
} // end serveIndex

// Either serve 'index.html', or run json handler
function interceptHTML(response, jsonHandler, authenticated)
{
    response.format({
        html: serveIndex,
        json: (request, response) => 
        {
            if(!authenticated || request.isAuthenticated())
            {
                jsonHandler(request, response);
            }
            else
            {
                response.status(401).json({
                    name: 'Not Authorized',
                    message: `Not authorized.`,
                    code: 'ERR_NOT_AUTHORIZED'
                });
            } // end if
        }
    });
} // end interceptHTML

function ensureAuthenticated(request, response, next)
{
    if(request.isAuthenticated())
    {
        next();
    }
    else
    {
        response.status(401).json({
            name: 'Not Authorized',
            message: `Not authorized.`,
            code: 'ERR_NOT_AUTHORIZED'
        });
    } // end if
} // end ensureAuthenticated

function promisify(handler)
{
    return (request, response) =>
    {
        Promise.resolve(handler(request, response))
            .then((results) =>
            {
                if(!response.finished)
                {
                    response.json(results);
                } // end if
            })
            .catch((error) =>
            {
                console.error(error.stack || error.message);

                let errorJSON = {};
                if(_.isFunction(error.toJSON))
                {
                    errorJSON = error.toJSON();
                }
                else
                {
                    errorJSON = {
                        name: error.constructor.name,
                        message: error.message,
                        code: error.code,
                        error
                    };
                } // end if

                response.status(500).json(errorJSON);
            });
    };
} // end promisify

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    requestLogger: buildBasicRequestLogger,
    errorLogger: buildBasicErrorLogger,
    interceptHTML,
    serveIndex,
    ensureAuthenticated,
    promisify
}; // end exports

//----------------------------------------------------------------------------------------------------------------------
