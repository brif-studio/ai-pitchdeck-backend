const UserService = require('../services/Sequelize/UserService')
const UserWalletService = require('../services/Sequelize/UserWalletService')
const { checkUser, createToken, verifyToken } = require('../scripts/helpers/tokenHelper')
const { hashTextWithSalt } = require('../scripts/helpers/hashHelper')
const RefreshTokenService = require('../services/Sequelize/RefreshTokenService')
const RoleService = require('../services/Sequelize/RoleService')
const VerificationCodeService = require('../services/Sequelize/VerificationCodeService')
const { SuccessResult, SuccessDataResult, ErrorDataResult, ErrorResult } = require('../scripts/utils/results')
const { AuthError } = require('../scripts/utils/Errors')
require('express-async-errors')

class AuthController{
    async login(req, res){
        const { emailOrUserName, password } = req.body
        const user = await UserService.getByUserNameOrEmail(emailOrUserName)
        if (user) {
            console.log(user.password)
            if (checkUser(user, password)) {
                const responseData = {
                    token: createToken({ id: user.id, userName: user.userName, email: user.email }),
                    refreshToken: await RefreshTokenService.add(user.id)
                }
                return res.status(200).json(new SuccessDataResult('Login successfull!', responseData))
            } else {
                return res.status(401).json(new ErrorResult('Your login information is wrong!'))
            }
        } else {
            res.status(401).json(new ErrorResult('User not found!'))
        }
    }


    async register(req, res){
        const body = req.body
        const isUserExists = await UserService.checkUserExists(body)
        if (!isUserExists) {
            console.log('user exists')
            throw new AuthError('User is already exists!')
        }
        body.password = hashTextWithSalt(body.password, 10)
        body.emailConfirmed = false
        const addedUser = await UserService.add(body)
        await VerificationCodeService.add(addedUser.id)
        await RoleService.addRoleToUser('User', addedUser)
        await UserWalletService.add({userId: addedUser.id})
        const responseData = {
            token: createToken({ id: addedUser.id, userName: addedUser.userName, email: addedUser.email }),
            refreshToken: await RefreshTokenService.add(addedUser.id)
        }
        res.status(200).json(new SuccessDataResult('User registered!', responseData))
    }
}

module.exports = new AuthController()