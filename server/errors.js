//----------------------------------------------------------------------------------------------------------------------
// Custom errors
//
// @module error.js
//----------------------------------------------------------------------------------------------------------------------

class AppError extends Error
{
    constructor (message, code)
    {
        // Calling parent constructor of base Error class.
        super(message);

        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;

        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);

        // Set a code property to allow the error to be easily identified. This is in keeping with current nodejs.
        this.code = !!code ? code : 'ERR_APPLICATION_ERROR';
    } // end constructor

    toJSON()
    {
        return { name: this.name, message: this.message, code: this.code };
    } // end toJSON
} // end AppError

//----------------------------------------------------------------------------------------------------------------------

class NotFoundError extends AppError
{
    constructor(message)
    {
        super(message, 'ERR_NOT_FOUND');
    } // end constructor
} // end NotFoundError

//----------------------------------------------------------------------------------------------------------------------

class NotImplementedError extends AppError
{
    constructor(api)
    {
        super(`'${api}' is not implemented.`, 'ERR_NOT_IMPLEMENTED');
    } // end constructor
} // end NotImplemented Error

//----------------------------------------------------------------------------------------------------------------------

class MultipleResultsError extends AppError
{
    constructor(thing)
    {
        super(`More than one ${ thing } returned. This should not be possible.`, 'ERR_MULTIPLE_RESULTS');
    } // end constructor
} // end MultipleResultsError

//----------------------------------------------------------------------------------------------------------------------

class ValidationError extends AppError
{
    constructor(prop, reason)
    {
        super(`Validation failed for '${ prop }': ${ reason }.`, 'ERR_VALIDATION_FAILED');
    } // end constructor
} // end ValidationError

//----------------------------------------------------------------------------------------------------------------------

module.exports = {
    AppError,
    NotFoundError,
    NotImplementedError,
    MultipleResultsError,
    ValidationError
};

//----------------------------------------------------------------------------------------------------------------------
