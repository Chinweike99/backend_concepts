"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.addToCart = exports.getCart = void 0;
const uuid_1 = require("uuid");
let carts = [];
let products = [
    { id: '1', name: 'Laptop', price: 999.99, stock: 10 },
    { id: '2', name: 'Mouse', price: 29.99, stock: 50 },
    { id: '3', name: 'Keyboard', price: 79.99, stock: 30 }
];
const getCart = (userId) => {
    return carts.find(cart => cart.userId === userId || { userId, items: [], total: 0 });
};
exports.getCart = getCart;
const addToCart = (userId, productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
        throw new Error("Product not found");
    }
    ;
    let cart = carts.find(c => c.userId === userId);
    if (!cart) {
        cart = { userId, items: [], total: 0 };
        carts.push(cart);
    }
    ;
    const existingItem = cart.items.find((item) => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    }
    else {
        cart.items.push({
            id: (0, uuid_1.v4)(),
            productId,
            name: product.name,
            price: product.price,
            quantity
        });
    }
    ;
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return cart;
};
exports.addToCart = addToCart;
const removeFromCart = (userId, itemId) => {
    const cart = carts.find(c => c.id === userId);
    if (!cart) {
        throw new Error("Product dot found");
    }
    cart.items = cart.items.filter((item) => item.id !== itemId);
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return cart;
};
exports.removeFromCart = removeFromCart;
const clearCart = (userId) => {
    const cart = carts.find(c => c.userId === userId);
    if (cart) {
        cart.items = [];
        cart.total = 0;
    }
    ;
    return cart;
};
exports.clearCart = clearCart;
