import amqp from 'amqplib';


const EXCHANGE = "order_events";

export async function consumerOrderEvents(){
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, "fanout", {durable: false});

    const q = await channel.assertQueue("", {exclusive: true});
    channel.bindQueue(q.queue, EXCHANGE, "");

    console.log("[*] Email Service waiting for order events")
    channel.consume(q.queue, (msg) => {
        if(msg) {
            const order = JSON.parse(msg.content.toString());
            console.log("Sent confirmation email for", order)
            channel.ack(msg);
        }
    })
};

export async function publishOrderEvent(order){
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, "fanout", {durable: false});

    channel.publish(EXCHANGE, "", Buffer.from(JSON.stringify(order)));
    console.log("Event Published");

    await channel.close();
    await connection.close();

}


