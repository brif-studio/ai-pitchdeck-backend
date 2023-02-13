const UserService = require('../services/Sequelize/UserService')
const VerificationCodeService = require('../services/Sequelize/VerificationCodeService')
const { decodeToken, verifyEmailVerificationCode } = require('../scripts/helpers/hashHelper')
require('express-async-errors')

class VerificationCodeController{

    async checkUserCodes(userId){
        const code = await VerificationCodeService.getOneFiltered({
            userId:userId,
            isVerified:false
        })
        if(!code){
            return null
        }else{
            return code
        }
    }

    async verify(req,res){
        const userId = hashHelper.decodeToken(req.headers.authorization.split(' ')[1]).id
        const codeInput = req.params['code']
        const code = await checkUserCodes(userId)
        const user = await UserService.getOneFiltered({ id:userId })
        if (code === null) {
            throw new AuthError('There is no code has sent!')
        }
        const success = verifyEmailVerificationCode(codeInput, code.code)
        const newCode = code
        if (success) {
            newCode.isVerified = true
            user.emailConfirmed = true
            await newCode.save()
            await user.save()
            return res.json(new SuccessResult('Code verified!'))
        }else{
            throw new AuthError('You entered the wrong code!')
        }
    }
}

module.exports = new VerificationCodeController()