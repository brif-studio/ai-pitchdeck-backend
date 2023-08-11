class Mail { 
    constructor(to, subject, html, from = {
        name: process.env.SENDER_NAME,
        address: process.env.SENDER_ADDRESS,
        }){
        this.to = to
        this.subject = subject
        this.html = html
        this.from = from
    }

    toJsonObject(){
        return {
            to: this.to,
            subject: this.subject,
            html: this.html,
            from: this.from
        }
    }
}

module.exports = Mail
