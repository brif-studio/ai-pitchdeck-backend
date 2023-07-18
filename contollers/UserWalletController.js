const httpStatus = require('http-status')
const userService = require('../services/Sequelize/UserService')
const userWalletService = require('../services/Sequelize/UserWalletService')
const { SuccessResult, SuccessDataResult, ErrorResult, ErrorDataResult } = require('../scripts/utils/results')
const db = require('../loaders/index').db
const { AuthError } = require('../scripts/utils/Errors/')
const { createToken } = require('../scripts/helpers/tokenHelper')
const { decodeToken } = require('../scripts/helpers/hashHelper')
const includes = [
    {
        model: db.userWallets
    }
]
require('express-async-errors')

class UserWalletController{
    async getUserWallet(req, res){
        const userId = decodeToken(req.headers.authorization.split(' ')[1]).id
        const userWallet = await userWalletService.getUserWallet(userId)
        return res.json(new SuccessDataResult(null,userWallet))
    }

    async decreaseUserCredit(req, res){
        const userId = decodeToken(req.headers.authorization.split(' ')[1]).id
        const amount = req.body.amount
        const result = await userWalletService.decreaseUserCredit(userId,amount)
        if (result) {
            return res.json(new SuccessResult())
        }
        return res.json(new ErrorResult())
    }

}

module.exports = new UserWalletController()