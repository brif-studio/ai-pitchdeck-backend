class AuthError extends Error{
    constructor(message=null,){
        super(message)
    }
}

module.exports = AuthError