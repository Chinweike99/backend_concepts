"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCartHandler = exports.removeFromCartHandler = exports.addToCartHandler = exports.getCartHandler = void 0;
const cartServices_1 = require("../services/cartServices");
const rabbitmq_1 = require("../config/rabbitmq");
const getCartHandler = (req, res) => {
    try {
        const { userId } = req.params;
        const cart = (0, cartServices_1.getCart)(userId);
        res.json(cart);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get cart' });
    }
};
exports.getCartHandler = getCartHandler;
const addToCartHandler = (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ error: "Product ID amd quantity required" });
        }
        const cart = (0, cartServices_1.addToCart)(userId, productId, quantity);
        // Send message to RabbitMQ for cart operation tracking
        const channel = (0, rabbitmq_1.getChannel)();
        channel.sendToQueue('cart_operations', Buffer.from(JSON.stringify({
            type: "ADD_TO_CART",
            userId,
            productId,
            quantity,
            timeStamp: new Date().toISOString()
        })));
        res.json(cart);
    }
    catch (error) {
        res.status(400).json({ error: "Error adding to cart" });
    }
};
exports.addToCartHandler = addToCartHandler;
const removeFromCartHandler = (req, res) => {
    try {
        const { userId, itemId } = req.params;
        const cart = (0, cartServices_1.removeFromCart)(userId, itemId);
        // Send message to RabbitMQ
        const channel = (0, rabbitmq_1.getChannel)();
        channel.sendToQueue('cart_operations', Buffer.from(JSON.stringify({
            type: 'REMOVE_FROM_CART',
            userId,
            itemId,
            timestamp: new Date().toISOString()
        })));
        res.json(cart);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.removeFromCartHandler = removeFromCartHandler;
const clearCartHandler = (req, res) => {
    try {
        const { userId } = req.params;
        const cart = (0, cartServices_1.clearCart)(userId);
        // Send message to RabbitMQ
        const channel = (0, rabbitmq_1.getChannel)();
        channel.sendToQueue('cart_operations', Buffer.from(JSON.stringify({
            type: 'CLEAR_CART',
            userId,
            timestamp: new Date().toISOString()
        })));
        res.json(cart);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
};
exports.clearCartHandler = clearCartHandler;
