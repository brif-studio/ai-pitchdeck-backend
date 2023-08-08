const validator = require('validator');
const amqp = require("amqplib");

const mailSender = async (req, res, next) => {

    req = {
        "body": {
            "from": 0,
            "to": ["umut", "ali", "umut.karapinar01@gmail.com"],
            "subject": "asd",
            "html": "html"
        }
    }
    const connection = await amqp.connect("amqp://localhost:5672");
    const channel = await connection.createChannel();

    await channel.assertQueue("mailSender");

    let mailShema = {
        "from": req.body.from,
        "to": "",
        "subject": req.body.subject,
        "html": req.body.html
    };
    var theList = req.body.to;
    let okList = [];
    let errorList = [];

    let listLength = theList.length;

    for (let i = 0; i < listLength; i++) {
        if (validator.isEmail(theList[i])) {
            okList.push(theList[i]);
            mailShema.to = theList[i];
            channel.sendToQueue("mailSender", Buffer.from(JSON.stringify(mailShema)))
            console.log(theList[i] + " gönderiliyor")

        } else {
            errorList.push(theList[i]);
        }

    }
    console.log("bitti");
    console.log("hatalı mailler: "+ errorList.toString());


}
mailSender();

module.exports = mailSender;