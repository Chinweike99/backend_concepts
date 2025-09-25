import amqp from 'amqplib';

let connection: amqp.Connection | any;
let channel: amqp.Channel;

export const connectRabbitMQ = async(): Promise<void> => {
    try {
        connection  = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
        channel = await connection.createChannel();

        await channel.assertQueue('cart_operations', {durable: true});
        await channel.assertQueue('order_processing', {durable: true});
        await channel.assertQueue('email_notifications', {durable: true});
        
        console.log("Connected to RabbitMQ and queues declared")

    } catch (error) {
        console.log("RabbitMQ connection failed: ", error);
        process.exit(1);
    }
};

export const getChannel = (): amqp.Channel => {
    if(!channel){
        throw new Error("RabbitMQ channel not available")
    }
    return channel;
};

export const closeConnection = async () : Promise<void> => {
    if(connection){
        await connection.close();
    }
}