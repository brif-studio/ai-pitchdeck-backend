const UserService = require('../services/Sequelize/UserService')
const AuthError = require('../scripts/utils/Errors/AuthError')
const { hashTextWithSalt } = require('../scripts/helpers/hashHelper')
const UserTokenService = require('../services/Sequelize/UserTokenService')

class UserTokenController{
    async verifyUserTokenAndChangePassword(req, res){
        const userToken = await UserService.getOneFiltered({token:req.params.token, active:false})
        if (!userToken) {
            throw new AuthError('Token not found!')
        }
        const isExpired = userToken.expirationDate.getTime() < new Date().getTime();
        if (isExpired) {
            await UserService.delete(userToken.id)
            throw new AuthError('Refresh token is expired. Please login again!')
        }else{
            const user = await UserService.getOneFiltered({id:userToken.userId})
            user.passwordHash = hashTextWithSalt(req.body.newPassword,10)
            user.save()
            userToken.active = true
            userToken.save()
            return userToken
        }
    }

    async createResetPasswordToken(req, res){
        const { email } = req.body
        await UserTokenService.add(email)
        res.json(new SuccessResult('Password reset email has sent!'))
    }
}

module.exports = new UserTokenController()