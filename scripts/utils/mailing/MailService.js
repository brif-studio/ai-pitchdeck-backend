const rabitmqHelper = require("../../helpers/rabbitmqHelper")

class MailService {
    constructor(mailService) {
        this.mailService = mailService
    }

    sendMail(mail) {
        rabitmqHelper.publishToExchange('sys.mail', JSON.stringify(mail.toJsonObject()));
    }
}

module.exports = new MailService()