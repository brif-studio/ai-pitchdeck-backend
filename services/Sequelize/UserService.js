const SequelizeBaseService = require('./SequelizeBaseService')
const { users } = require('../../loaders/index').db
const { Op } = require('sequelize')
const AuthError = require('../../scripts/utils/Errors/AuthError')

class UserService extends SequelizeBaseService{
    constructor(){
        super(users)
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
        const user = await this.getOneFiltered({[Op.or]:[{email:userNameOrEmail},{userName:userNameOrEmail}]})
        if(user){
            return user
        } 
        return null
    }
}

module.exports = new UserService()