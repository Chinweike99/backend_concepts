import { Request, Response } from 'express';
import { createOrder, getOrders, getOrder } from '../services/orderService';
import { getCart, clearCart } from '../services/cartServices';
import { getChannel } from '../config/rabbitmq';

export const createOrderHandler = (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { shippingInfo } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required in the route' });
    }

    if (!shippingInfo || !shippingInfo.address || !shippingInfo.email) {
      return res.status(400).json({ error: 'Shipping information is required' });
    }

    console.log("Shipping info", shippingInfo);

    const cart = getCart(userId);
    console.log("Cart info ......", cart);

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    console.log("Cart info", cart);

    const order = createOrder(userId, cart, shippingInfo);
    console.log("Order info", order);

    // Clear cart after successful order
    clearCart(userId);

    const channel = getChannel();

    // Send to order processing queue
    channel.sendToQueue(
      'order_processing',
      Buffer.from(JSON.stringify({
        orderId: order.id,
        userId,
        total: order.total,
        timestamp: new Date().toISOString()
      })),
      { persistent: true }
    );

    // Send to email notifications queue
    channel.sendToQueue(
      'email_notifications',
      Buffer.from(JSON.stringify({
        type: 'ORDER_CONFIRMATION',
        email: shippingInfo.email,
        orderId: order.id,
        total: order.total,
        items: order.items,
        timestamp: new Date().toISOString()
      })),
      { persistent: true }
    );

    res.status(201).json(order);

  } catch (error: any) {
    res.status(400).json({ error: `Unable to create order ${error.message}` });
  }
};


export const getOrdersHandler = (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const orders = getOrders(userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const getOrderHandler = (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = getOrder(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get order' });
  }
};