const amqp = require("amqplib");

class RabitmqConnection {
    sendMail = async (mail) => {

        const connection = await amqp.connect("amqp://localhost:5672");
        const channel = await connection.createChannel();

        await channel.assertQueue("mailSender");
        let mailShema = {
            "from": '"Denem mail" <support@linyit.net>',
            "to": mail.to,
            "subject": mail.subject,
            "html": mail.html
        };
        channel.sendToQueue("mailSender", Buffer.from(JSON.stringify(mailShema)));
        console.log("a")
    }
}

module.exports = RabitmqConnection;