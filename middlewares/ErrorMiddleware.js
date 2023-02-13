const errorHandler = require('../scripts/handlers/ErrorHandler')

const errorMiddleware = async (err, req, res, next) => {
    if (!errorHandler.isTrustedError(err)) {
        next(err)
    }
    return errorHandler.handleError(err, res)
}

module.exports = errorMiddleware 