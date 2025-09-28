import { v4 as uuidv4 } from 'uuid';

// Mock database
let orders: any[] = [];
let products = [
  { id: '1', name: 'Laptop', price: 999.99, stock: 10 },
  { id: '2', name: 'Mouse', price: 29.99, stock: 50 },
  { id: '3', name: 'Keyboard', price: 79.99, stock: 30 }
];

export const createOrder = (userId: string, cart: any, shippingInfo: any) => {
  // Validate stock availability
  for (const item of cart.items) {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.name}`);
    }
  }

  // Update stock
  for (const item of cart.items) {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
    }
  }

  const order = {
    id: uuidv4(),
    userId,
    items: cart.items,
    total: cart.total,
    shippingInfo,
    status: 'processing',
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  return order;
};

export const getOrders = (userId: string) => {
  return orders.filter(order => order.userId === userId);
};

export const getOrder = (orderId: string) => {
  return orders.find(order => order.id === orderId);
};