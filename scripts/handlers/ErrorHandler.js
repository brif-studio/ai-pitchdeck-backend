const { BaseError } = require('../utils/Errors')
const { ErrorResult } = require('../utils/results/')

class ErrorHandler {
    handleError(err, res) {
        return res.status(err.httpCode).json(new ErrorResult(err.description))
    }

    isTrustedError(error) {
        if (error instanceof BaseError) {
            return error.isOperational;
        }
        return false;
    }
}
const errorHandler = new ErrorHandler();
module.exports = errorHandler