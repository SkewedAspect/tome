//----------------------------------------------------------------------------------------------------------------------
// Brief description for utils.js module.
//
// @module utils.js
//----------------------------------------------------------------------------------------------------------------------

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

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
    response.setHeader("Content-Type", "text/html");
    fs.createReadStream(path.resolve(__dirname + '/../../' + 'dist/index.html')).pipe(response);
} // end serveIndex

// Either serve 'index.html', or run json handler
function interceptHTML(response, jsonHandler, authenticated)
{
    response.format({
        html: serveIndex,
        json: (request, response) => {

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
        handler(request, response)
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
                        error: error
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
