const NodemailerService = require('./nodemailer/NodemailerService')
const RabitmqConnection = require("./rabbitmqConnection")
const rabitmqHelper = require("../../helpers/rabbitmqHelper")

class MailService {
    constructor(mailService) {
        this.mailService = mailService
    }

    sendMail(mail) {
        rabitmqHelper.publishToExchange('sys.mail', JSON.stringify(mail));
        // return this.mailService.sendMail(mail)
    }
}

module.exports = new MailService()
//module.exports = new MailService(new NodemailerService())