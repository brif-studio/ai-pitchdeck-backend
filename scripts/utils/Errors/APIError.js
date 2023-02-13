const BaseError = require('./BaseError')

class APIError extends BaseError {
    constructor(name, httpCode = 500, isOperational = true, description = 'internal server error') {
        super(name, httpCode, description, isOperational);
    }
}

module.exports = APIError