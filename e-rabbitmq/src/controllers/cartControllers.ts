import { Request, Response } from "express";
import { addToCart, clearCart, getCart, removeFromCart } from "../services/cartServices";
import { getChannel } from "../config/rabbitmq";
import { timeStamp } from "console";



export const getCartHandler = (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const cart = getCart(userId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cart' });
  }
};


export const addToCartHandler = (req: Request, res: Response) => {
    try {
        const {userId} = req.params;
        const { productId, quantity } = req.body;

        if(!productId || !quantity){
            return res.status(400).json({ error: "Product ID amd quantity required"})
        }

        const cart = addToCart(userId, productId, quantity);
        // Send message to RabbitMQ for cart operation tracking
        const channel = getChannel();
        channel.sendToQueue('cart_operations', Buffer.from(JSON.stringify ({
            type: "ADD_TO_CART",
            userId,
            productId,
            quantity,
            timeStamp: new Date().toISOString()
        })))

        res.json(cart)
    } catch (error) {
        res.status(400).json({ error: "Error adding to cart"});
    }
}

export const removeFromCartHandler = (req: Request, res: Response) => {
  try {
    const { userId, itemId } = req.params;
    const cart = removeFromCart(userId, itemId);
    
    // Send message to RabbitMQ
    const channel = getChannel();
    channel.sendToQueue('cart_operations', Buffer.from(JSON.stringify({
      type: 'REMOVE_FROM_CART',
      userId,
      itemId,
      timestamp: new Date().toISOString()
    })));

    res.json(cart);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};


export const clearCartHandler = (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const cart = clearCart(userId);
    
    // Send message to RabbitMQ
    const channel = getChannel();
    channel.sendToQueue('cart_operations', Buffer.from(JSON.stringify({
      type: 'CLEAR_CART',
      userId,
      timestamp: new Date().toISOString()
    })));

    res.json(cart);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}