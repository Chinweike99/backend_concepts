import {v4 as uuidv4 } from 'uuid';


let carts: any[] = [];
let products = [
    { id: '1', name: 'Laptop', price: 999.99, stock: 10 },
    { id: '2', name: 'Mouse', price: 29.99, stock: 50 },
    { id: '3', name: 'Keyboard', price: 79.99, stock: 30 }
]

export const getCart = (userId: string) => {
    return carts.find(cart => cart.userId === userId || {userId, items: [], total: 0});
};

export const addToCart = (userId: string, productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if(!product){
        throw new Error("Product not found");
    };

    let cart = carts.find(c => c.userId === userId);
    if(!cart){
        cart = {userId, items: [], total: 0};
        carts.push(cart)
    };

    const existingItem = cart.items.find((item: any) => item.productId === productId);

    if(existingItem){
        existingItem.quantity += quantity
    }else{
        cart.items.push({
            id: uuidv4(),
            productId,
            name: product.name,
            price: product.price,
            quantity
        })
    };

    cart.total = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    return cart;
}


export const removeFromCart = ( userId: string, itemId: string) => {
    const cart = carts.find(c => c.id === userId);
    if(!cart){
        throw new Error("Product dot found")
    }
    cart.items = cart.items.filter((item: any) => item.id !== itemId);
    cart.total = cart.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    return cart;
};

export const clearCart = (userId: string) => {
    const cart = carts.find(c => c.userId === userId);
    if(cart){
        cart.items = [];
        cart.total = 0
    };
    return cart
}
