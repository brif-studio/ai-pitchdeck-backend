const MailService = require('./MailService')
const Mail = require("./Mail")
const emailTemplate = require('./templates/emailTemplate').emailTemplate
const rabitmqHelper = require("../../helpers/rabbitmqHelper")


async function asd() {
    for (let i = 0; i < 1; i++) {
        // let mail = {
        //     "from": 'support@linyit.net',
        //     "to": "dtv76833@zbock.com",
        //     "subject": i.toString(),
        //     "html": emailTemplate("passwordResetLink").toString()
        // };

        MailService.sendMail(new Mail("umut.karapinar01@gmail.com", i.toString(), emailTemplate("passwordResetLink")));


        console.log(i)

    }
}

asd()
