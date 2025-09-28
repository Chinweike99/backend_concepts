import amqp from 'amqplib';

const queue = "hello";

const sendMessage = async() => {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from("Hello RabbitMQ"));
    console.log("[x] sent 'Hello RabbitMQ'");
    await channel.close();
    await connection.close();
};

sendMessage()