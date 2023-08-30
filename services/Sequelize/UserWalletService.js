const { AuthError } = require('../../scripts/utils/Errors')
const SequelizeBaseService = require('./SequelizeBaseService')
const { userWallets } = require('../../loaders/index').db

class UserWalletService extends SequelizeBaseService{
    constructor(){
        super(userWallets)
    }

    async decreaseUserCredit(userId, amount=1) {
        const userWallet = await this.getOneFiltered({userId: userId})
        console.log(userWallet.userId)
        if (userWallet) {
            if (userWallet.creditCount >= amount) {
                userWallet.creditCount -= amount
                await userWallet.save()
                return true
            }
            throw new AuthError('Not enough credit')
        }
        throw new AuthError('User wallet not found')
    }

    async increaseUserCredit(userId, amount=1) {
        const userWallet = await this.getOneFiltered({userId: userId})
        if (userWallet) {
            userWallet.credit += amount
            await userWallet.save()
            return true
        }
        throw new AuthError('User wallet not found')
    }

    async getUserWallet(userId) {
        const userWallet = await this.getOneFiltered({ userId: userId })
        if (userWallet) {
            return userWallet
        }
        throw new AuthError('User wallet not found')
    }

    async checkEnoughCredit(userId, amount=1) {
        const userWallet = await this.getOneFiltered({userId: userId})
        if (userWallet) {
            if (userWallet.creditCount >= amount) {
                return true
            }
            throw new AuthError('Not enough credit')
        }
        throw new AuthError('User wallet not found')
    }
}

module.exports = new UserWalletService()