const NodemailerService = require('./nodemailer/NodemailerService')
const RabitmqConnection=require("./rabbitmqConnection")

class MailService{
    constructor(mailService){
        this.mailService = mailService
    }

    sendMail(mail){
        return this.mailService.sendMail(mail)
    }
}

module.exports = new MailService(new RabitmqConnection())