const MailService = require('./MailService')
const Mail = require("./Mail")
const emailTemplate = require('./templates/emailTemplate').emailTemplate
const rabitmqHelper = require("../../helpers/rabbitmqHelper")

let mail = {
    "from": '"Denem mail" <support@linyit.net>',
    "to": "mail.to",
    "subject": "mail.subject",
    "html": "mail.html"
};
async function asd() {
    for (let i = 0; i < 10001; i++) {
        await rabitmqHelper.publishToExchange('sys.mail', JSON.stringify(mail))


        console.log(i)

    }
}

asd()

