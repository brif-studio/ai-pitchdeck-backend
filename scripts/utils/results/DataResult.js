const Result = require('./Result')

class DataResult extends Result{
    constructor(success,message, data){
        super(success, message)
        this.data = data
    }
}

module.exports = DataResult