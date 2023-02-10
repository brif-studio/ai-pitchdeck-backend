const nodemailerService = require('./nodemailer/NodemailerService')

class MailService{
    constructor(mailService){
        this.mailService = mailService
    }

    sendMail(mail){
        return this.mailService.sendMail
    }
}

module.exports = new MailService(new NodemailerService())