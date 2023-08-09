const amqplib = require('amqplib');
require('dotenv').config()

class RabbitMQHelper {

    async connect() {
        this.connection = await amqplib.connect("amqp://localhost:5672")
        this.channel = await this.connection.createChannel();
        this.exchange = (await this.channel.assertExchange(process.env.RABBITMQ_EXCHANGE, 'topic', { durable: false })).exchange;
    }

    async publishToExchange(key, message) {
        await this.connect();
        this.channel.publish(this.exchange, key, Buffer.from(message));
        console.log("Mesaj başarıyla yayınlandı.");
    } catch(error) {
        console.error("Hata oluştu:", error);
    }

}


module.exports = new RabbitMQHelper();