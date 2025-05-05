import redis from 'redis'


async function inventoryManager() {
    const client = redis.createClient({url: "redis://localhost:6379"});
    await client.connect();
    
    try {
      // Initialize inventory
      await client.hSet('product:123', {
        name: 'Smartphone',
        price: '599',
        stock: '10'
      });
      
      console.log('Initial product data:');
      console.log(await client.hGetAll('product:123'));
      
      // Function to process an order with optimistic locking
      async function processOrder(productId, quantity) {
        // Start a WATCH on the product key to enable optimistic locking
        await client.watch(`product:${productId}`);
        
        // Get current stock
        const product = await client.hGetAll(`product:${productId}`);
        const currentStock = parseInt(product.stock, 10);
        
        if (currentStock < quantity) {
          // Insufficient stock, cancel the transaction
          await client.unwatch();
          console.log(`Order failed: Requested ${quantity}, but only ${currentStock} available`);
          return false;
        }
        
        // Start a transaction
        const transaction = client.multi();
        
        // Update stock
        transaction.hSet(`product:${productId}`, 'stock', (currentStock - quantity).toString());
        
        // Create order record
        const orderId = Date.now().toString();
        transaction.hSet(`order:${orderId}`, {
          product_id: productId,
          quantity: quantity.toString(),
          timestamp: Date.now().toString(),
          total_price: (quantity * parseInt(product.price, 10)).toString()
        });
        
        // Add to order list
        transaction.lPush('recent_orders', orderId);
        
        // Execute transaction (will fail if product:123 was modified by another client)
        try {
          await transaction.exec();
          console.log(`Order processed successfully. Order ID: ${orderId}`);
          return true;
        } catch (err) {
          console.log('Transaction failed due to concurrent modification. Retrying...');
          return false;
        }
      }
      
      // Simulate multiple orders
      console.log('\nProcessing orders:');
      await processOrder('123', 3);
      await processOrder('123', 5);
      
      // Try to order more than available
      await processOrder('123', 5);
      
      // Check final product state
      console.log('\nFinal product data:');
      console.log(await client.hGetAll('product:123'));
      
      // Get recent orders
      const recentOrders = await client.lRange('recent_orders', 0, -1);
      console.log('\nRecent orders:', recentOrders);
      console.log('Order details:', await client.hGetAll(`order:${recentOrders[0]}`));
      
    } catch (err) {
      console.error('Error:', err);
    } finally {
      await client.quit();
    }
  }
  
inventoryManager();