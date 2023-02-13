const BaseError = require('./BaseError')
const  httpStatus = require('http-status')

class AuthError extends BaseError {
    constructor(description = 'bad request') {
        super('Authentication Error', httpStatus.UNAUTHORIZED, description, true);
    }
}

module.exports = AuthError