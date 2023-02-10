const SequelizeBaseService = require('./SequelizeBaseService')
const { refreshTokens } = require('../../loaders').db
const UserService = require('./UserService')
const { v4:uuidv4 } = require('uuid');
const AuthError = require('../scripts/utils/Errors/AuthError')

class RefreshTokenService extends SequelizeBaseService{
    constructor(){
        super(refreshTokens)
    }

    async add(){
        const user = await UserService.getById(userId);
        const userToken = await this.getOneFiltered({userId:userId});
        if (userToken) {
            await this.deleteUserRefreshToken(userId);
        }
        if (!user) {
            throw new AuthError('User not found!');
        }
        const token = uuidv4();
        const expirationDate = new Date();
        expirationDate.setSeconds(expirationDate.getSeconds() + 86400);
        let refreshToken = await this.entityType.create({
            token:token,
            userId:userId,
            expirationDate:expirationDate
        });
        
        return refreshToken.token
    }

    async deleteUserRefreshToken(userId){
        const token = await refreshTokenRepository.getOneFiltered({ userId:userId});
        await this.entityType.destroy({where:{id:token.id}});
    }
}

module.exports = new RefreshTokenService()