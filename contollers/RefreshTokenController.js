const httpStatus = require('http-status')
const RefreshTokenService = require('../services/Sequelize/RefreshTokenService')
const { SuccessResult, SuccessDataResult, ErrorResult, ErrorDataResult } = require('../scripts/utils/results')
const AuthError = require('../scripts/utils/Errors/AuthError')
const { createToken } = require('../scripts/helpers/tokenHelper')

class RefreshTokenController{
    async verifyRefreshToken(token){
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

    async resetToken(req, res){
            const { refreshToken } = req.body
            const token = await verifyRefreshToken(refreshToken)
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