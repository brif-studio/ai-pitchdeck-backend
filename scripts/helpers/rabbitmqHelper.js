const amqplib = require('amqplib');
require('dotenv').config()

class RabbitMQHelper {

    async connect() {
        this.connection = await amqplib.connect(process.env.RABBITMQ_CONNECTION_URL)
        this.channel = await this.connection.createChannel();
        this.exchange = (await this.channel.assertExchange(process.env.RABBITMQ_EXCHANGE, 'topic', { durable: false })).exchange;
    }

    async publishToExchange(key, message) {
        this.channel.publish(this.exchange, key, Buffer.from(message));
    }
}


const rabbitmqHelper = new RabbitMQHelper();
rabbitmqHelper.connect();
module.exports = rabbitmqHelper;