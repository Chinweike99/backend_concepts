"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnection = exports.getChannel = exports.connectRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
let connection;
let channel;
const connectRabbitMQ = async () => {
    try {
        connection = await amqplib_1.default.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
        channel = await connection.createChannel();
        await channel.assertQueue('cart_operations', { durable: true });
        await channel.assertQueue('order_processing', { durable: true });
        await channel.assertQueue('email_notifications', { durable: true });
        console.log("Connected to RabbitMQ and queues declared");
    }
    catch (error) {
        console.log("RabbitMQ connection failed: ", error);
        process.exit(1);
    }
};
exports.connectRabbitMQ = connectRabbitMQ;
const getChannel = () => {
    if (!channel) {
        throw new Error("RabbitMQ channel not available");
    }
    return channel;
};
exports.getChannel = getChannel;
const closeConnection = async () => {
    if (connection) {
        await connection.close();
    }
};
exports.closeConnection = closeConnection;
