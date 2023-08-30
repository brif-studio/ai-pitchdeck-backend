const amqplib = require('amqplib');
require('dotenv').config()

class RabbitMQHelper {

    async connect() {
        this.connection = await amqplib.connect(process.env.RABBITMQ_CONNECTION_URL)
        this.channel = await this.connection.createChannel();
        this.exchange = (await this.channel.assertExchange(process.env.RABBITMQ_EXCHANGE, 'topic', { durable: false })).exchange;
    }

    async publishToExchange(key, message) {
        try {
            if (!this.connection) {
                await this.connect()
            }
            this.channel.publish(this.exchange, key, Buffer.from(message));
            console.log("Mesaj başarıyla yayınlandı.");
        } catch (error) {
            await this.connect()
            console.log(error)
        }

    }

}


const rabbitmqHelper = new RabbitMQHelper();
module.exports = rabbitmqHelper;
