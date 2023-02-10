const SequelizeBaseService = require('./SequelizeBaseService')
const { verificationCodes } = require('../../loaders/').db
const { generateEmailVerificationCode } = require('../../scripts/helpers/hashHelper')
const UserService = require('./UserService')
const MailService = require('../../scripts/utils/mailing/MailService')
const Mail = require('../../scripts/utils/mailing/Mail')
const emailTemplate = require('../../scripts/utils/mailing/templates/emailTemplate').emailTemplate

class VerificationCodeService extends SequelizeBaseService{
    constructor(){
        super(verificationCodes)
    }

    async add(userId){
        const generatedCode = await generateEmailVerificationCode(5)
        const code = { code: generatedCode, isVerified: false, codeDeadline: Date.now(), userId: userId }
        const addedCode = await this.entityType.create(code)
        const user = await UserService.getOneFiltered({ id: userId })
        await MailService.sendMail(new Mail(user.email, 'test', emailTemplate(generatedCode)))
        return addedCode
    }
}

module.exports = new VerificationCodeService()