const Result = require('./Result')

class SuccessResult extends Result{
    constructor(message=null){
        super(true, message)
    }
}

module.exports = SuccessResult