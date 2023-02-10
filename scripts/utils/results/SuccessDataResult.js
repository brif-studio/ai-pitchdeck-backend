const DataResult = require('./DataResult')

class SuccessDataResult extends DataResult{
    constructor(message, data){
        super(true, message, data)
    }
}

module.exports = SuccessDataResult