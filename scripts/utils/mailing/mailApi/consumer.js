const amqp = require("amqplib");
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: "smtp.mail.me.com",
    port: 587,
    tls: {
        rejectUnauthorized: true,
        minVersion: "TLSv1.2",
    },
    auth: {
        user: "umut.karapinar01@icloud.com",
        pass: "mkni-eecr-jjbd-zdgm",
    },
});

async function connect_rabbitmq() {
    let theFrom;

    try {
        const connection = await amqp.connect("amqp://localhost:5672");
        const channel = await connection.createChannel();

        await channel.assertQueue("mailQueue");
        console.log("Mesaj bekleniyor... ");
        channel.consume("mailQueue", (msg) => {
            let parse = JSON.parse(msg.content.toString());

            switch (parse.from) {                  //hangi mail adresinden maili atacağımızı belirlemk için
                case 0:
                    theFrom = "me@umutzan.dev";
                    break;
                case 1:
                    theFrom = "support@linyit.net";
                    break;
            }

            transporter
                .sendMail({                                                     //mail gönerem işlemini yapan arakaş
                    from: ' "AI lı bir şeler A.Ş." <' + theFrom + '>',
                    to: parse.to,
                    subject: parse.subject,
                    html: parse.html,
                })
                .then(() => {
                    channel.ack(msg);
                    console.log("mail gönderildi");
                })
                .catch((error) => {
                    console.log(error);
                });
        });
    } catch (error) {
        console.log(error);
    }
}

connect_rabbitmq();