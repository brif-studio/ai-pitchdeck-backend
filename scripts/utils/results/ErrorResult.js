const Result = require('./Result')

class ErrorResult extends Result{
    constructor(message){
        super(false, message)
    }
}

module.exports = ErrorResult