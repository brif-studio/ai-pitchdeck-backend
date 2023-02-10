const SequelizeBaseService = require('./SequelizeBaseService')
const User = require('../../models/User.model')
const { Op } = require('sequelize')
const AuthError = require('../../scripts/utils/Errors/AuthError')

class UserService extends SequelizeBaseService{
    constructor(){
        super(User)
    }

    async checkUserExists(userForRegister){
        const user = await this.getFiltered({[Op.or]:[{ email: userForRegister.email }, {userName:userForRegister.userName}]})
        let isEmpty = Object.keys(user).length === 0
        if (!isEmpty) {
            return false
        }
        return true
    }

    async getByUserNameOrEmail(userNameOrEmail){
        const user = await this.getFiltered({[Op.or]:[{email:userNameOrEmail},{userName:userNameOrEmail}]})
        let isEmpty = Object.keys(user).length === 0
        if(!isEmpty){
            return null
        } 
        return user
    }
}

module.exports = new UserService()