import amqp from 'amqplib';

const QUEUE = 'orders';

export async function publishOrder(order){
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, {durable: true});

    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(order)), {
        persistent: true,
    });

    console.log("Published Order: ", order);
    await channel.close();
    await connection.close()

}


export async function consumeOrders(){
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE, (msg) => {
        if(msg){
            const order = JSON.parse(msg.content.toString());
            console.log(" [✔] Processing order:", order);
      setTimeout(() => {
        console.log(" [✔] Finished order:", order);
        channel.ack(msg);
      }, 3000);
        }
    })
}