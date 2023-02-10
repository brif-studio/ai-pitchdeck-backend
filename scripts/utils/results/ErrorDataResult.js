const DataResult = require('./DataResult')

class ErrorDataResult extends DataResult{
    constructor(message, data){
        super(false, message, data)
    }
}

module.exports = ErrorDataResult