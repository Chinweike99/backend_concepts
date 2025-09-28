import amqp from 'amqplib';

const queue = 'hello';

const consumeMessage = async() => {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(queue);
    console.log("Waiting for  message in %s.", queue);
    channel.consume(queue, (msg) => {
        if(msg){
            console.log("Recieved %s", msg.content.toString());
            channel.ack(msg);
        }
    })
};

consumeMessage();