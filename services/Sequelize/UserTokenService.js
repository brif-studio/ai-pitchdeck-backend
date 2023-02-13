const SequelizeBaseService = require('./SequelizeBaseService')
const { userTokens } = require('../../loaders').db
const UserService = require('./UserService')
const MailService = require('../../scripts/utils/mailing/MailService')
const Mail = require('../../scripts/utils/mailing/Mail')
const { generateToken } = require('../../scripts/helpers/hashHelper')
const emailTemplate = require('../../scripts/utils/mailing/templates/emailTemplate').emailTemplate
require('dotenv').config()

class UserTokenService extends SequelizeBaseService{
    constructor(){
        super(userTokens)
    }

    async add(email){
        await this.deleteUserTokens(email)
        const token = generateToken(100)
        const expirationDate = new Date();
        const user = await UserService.getOneFiltered({email:email})
        if (!user) {
            return null
        }
        expirationDate.setSeconds(expirationDate.getSeconds() + 86400);
        const addedUserToken = this.entityType.create({
            token:token,
            userId:user.id,
            active:false,
            expirationDate:expirationDate
        })
        const passwordResetLink = `<a href='${process.env.PASSWORD_RESET_BASE_URL + "/" + token}'>click for reset password</a>`
        await MailService.sendMail(new Mail(email, 'password reset test', emailTemplate(passwordResetLink)))
        return addedUserToken
    }

    async deleteUserTokens(email){
        const user = await UserService.getOneFiltered({email:email})
        console.log(user)
        if (!user) {
            return null
        }
        await this.entityType.destroy({where:{
            userId:user.id,
            active:false
        }})
    }
}

module.exports = new UserTokenService()