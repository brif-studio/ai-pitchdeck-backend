const UserService = require('../services/Sequelize/UserService')
const { AuthError } = require('../scripts/utils/Errors/')
const { hashTextWithSalt } = require('../scripts/helpers/hashHelper')
const UserTokenService = require('../services/Sequelize/UserTokenService')
const { SuccessResult, ErrorResult } = require('../scripts/utils/results')
const httpStatus = require('http-status')
require('express-async-errors')

class UserTokenController{
    async verifyUserTokenAndChangePassword(req, res){
        console.log(req.params.token)
        const userToken = await UserTokenService.getOneFiltered({token:req.params.token, active:false})
        if (!userToken) {
            throw new AuthError('Token not found!')
        }
        const isExpired = userToken.expirationDate.getTime() < new Date().getTime();
        if (isExpired) {
            await UserService.delete(userToken.id)
            throw new AuthError('Refresh token is expired. Please login again!')
        }else{
            const user = await UserService.getOneFiltered({id:userToken.userId})
            console.log(user)
            user.password = hashTextWithSalt(req.body.newPassword,10)
            user.save()
            userToken.active = true
            userToken.save()
            res.status(200).json(new SuccessResult('Password changed!')) 
        }
    }

    async createResetPasswordToken(req, res){
        const { email } = req.body
        const result = await UserTokenService.add(email)
        if (!result) {
            res.status(404).json(new ErrorResult('User not found!'))
        }
        res.json(new SuccessResult('Password reset email has sent!'))
    }
}

module.exports = new UserTokenController()