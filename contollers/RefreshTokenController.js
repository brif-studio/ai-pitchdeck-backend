const httpStatus = require('http-status')
const RefreshTokenService = require('../services/Sequelize/RefreshTokenService')
const { SuccessResult, SuccessDataResult, ErrorResult, ErrorDataResult } = require('../scripts/utils/results')
const { AuthError } = require('../scripts/utils/Errors/')
const { createToken } = require('../scripts/helpers/tokenHelper')
require('express-async-errors')

class RefreshTokenController{
    verifyRefreshToken = async (token) => {
        const refreshToken = await RefreshTokenService.getOneFiltered({token:token})
        if (!refreshToken) {
            throw new AuthError('Token not found!')
        }
        const isExpired = refreshToken.expirationDate.getTime() < new Date().getTime();
        if (isExpired) {
            await RefreshTokenService.delete(refreshToken.id)
            throw new AuthError('Refresh token is expired. Please login again!')
        }else{
            return refreshToken
        }
    }

    resetToken = async (req, res) => {
            const { refreshToken } = req.body
            const token = await this.verifyRefreshToken(refreshToken)
            const responseData = { 
                token: createToken({id:token.userId}) 
            }
            if (token) {
                res.json(new SuccessDataResult('Token refreshed!', responseData))
            }else{
                res.json(new ErrorResult('Token could not provided!'))
            }
    }
}

module.exports = new RefreshTokenController()