// Combining Pipelining and Transactions
import redis from 'redis';

async function pipelineTransactions() {
    const client = redis.createClient({ url: "redis://localhost:6379" });
    client.on("error", (error) => {
        console.error("Redis error:", error);
    });

    await client.connect();

    try {
        // Clear database for a clean slate
        await client.flushDb();

        // Use MULTI to group commands for atomic execution
        const userTx = client.multi();
        userTx.hSet('user:300', {
            username: "bob123",
            email: "bob@example.com",
            createdAt: Date.now().toString()
        });
        userTx.sAdd("users", "user:300");
        userTx.incr('stats:user_count');
        const userResult = await userTx.exec();

        // Another transaction for product setup
        const productTx = client.multi();
        productTx.hSet('product:500', {
            name: 'Wireless Headphones',
            price: '129.99',
            stock: '50',
            created_at: Date.now().toString()
        });
        productTx.sAdd('products', 'product:500');
        productTx.incr('stats:product_count');
        const productResult = await productTx.exec();

        // Logging results
        console.log("User Transaction Result:", userResult);
        console.log("Product Transaction Result:", productResult);

        // Verification
        const userData = await client.hGetAll('user:300');
        const productData = await client.hGetAll('product:500');
        const userCount = await client.get('stats:user_count');
        const productCount = await client.get('stats:product_count');

        console.log("\nVerification:");
        console.log("User:", userData);
        console.log("Product:", productData);
        console.log("User Count:", userCount);
        console.log("Product Count:", productCount);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.quit();
    }
}

// Real-world example: E-commerce batch processing
async function ecommerceSystem() {
    const client = redis.createClient({ url: "redis://localhost:6379" });
    client.on("error", (error) => {
        console.error("Redis error:", error);
    });

    await client.connect();
  
  try {
    // Initialize data
    await client.flushDb();
    
    // Create sample products
    const products = [
      { id: 'prod1', name: 'Laptop', price: 999, stock: 50 },
      { id: 'prod2', name: 'Phone', price: 699, stock: 100 },
      { id: 'prod3', name: 'Tablet', price: 349, stock: 75 }
    ];
    
    // Create sample orders
    const orders = [
      { id: 'order1', userId: 'user1', items: [{ productId: 'prod1', qty: 1 }, { productId: 'prod2', qty: 2 }] },
      { id: 'order2', userId: 'user2', items: [{ productId: 'prod3', qty: 1 }] },
      { id: 'order3', userId: 'user3', items: [{ productId: 'prod2', qty: 1 }, { productId: 'prod3', qty: 3 }] }
    ];
    
    // Initialize product data
    const prodPipeline = client.multi();
    products.forEach(product => {
      prodPipeline.hSet(`product:${product.id}`, {
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString()
      });
      prodPipeline.zAdd('products_by_price', { score: product.price, value: `product:${product.id}` });
    });
    await prodPipeline.exec();
    
    // Process orders in batch - each order is its own transaction for atomicity
    const ordersPipeline = client.multi();
    
    // For each order, add a transaction to the pipeline
    orders.forEach(order => {
      // Start transaction
      ordersPipeline.addCommand(['MULTI']);
      
      // Store order metadata
      ordersPipeline.hSet(`order:${order.id}`, {
        userId: order.userId,
        status: 'processing',
        created_at: Date.now().toString()
      });
      
      // Add to user's orders
      ordersPipeline.sAdd(`user:${order.userId}:orders`, `order:${order.id}`);
      
      // Process each item in the order
      let orderTotal = 0;
      
      order.items.forEach(item => {
        // Decrease stock
        ordersPipeline.hIncrBy(`product:${item.productId}`, 'stock', -item.qty);
        
        // Store order items
        ordersPipeline.hSet(`order:${order.id}:items:${item.productId}`, {
          quantity: item.qty.toString(),
          productId: item.productId
        });
        
        // Track for analytics
        ordersPipeline.zIncrBy('product_popularity', item.qty, `product:${item.productId}`);
        
        // Find product price for calculating total (in real app, you'd validate this first)
        const productPrice = products.find(p => p.id === item.productId).price;
        orderTotal += productPrice * item.qty;
      });
      
      // Store order total
      ordersPipeline.hSet(`order:${order.id}`, 'total', orderTotal.toString());
      
      // Update order status
      ordersPipeline.hSet(`order:${order.id}`, 'status', 'completed');
      
      // End transaction
      ordersPipeline.addCommand(['EXEC']);
    });
    
    // Execute all order transactions in one pipeline
    console.time('Process all orders');
    await ordersPipeline.exec();
    console.timeEnd('Process all orders');
    
    // Verify results
    console.log('\nOrder Results:');
    for (const order of orders) {
      console.log(`\nOrder ${order.id}:`, await client.hGetAll(`order:${order.id}`));
      
      for (const item of order.items) {
        console.log(`- Item ${item.productId}:`, 
          await client.hGetAll(`order:${order.id}:items:${item.productId}`));
      }
    }
    
    console.log('\nUpdated Product Stock:');
    for (const product of products) {
      console.log(`${product.name}:`, await client.hGet(`product:${product.id}`, 'stock'));
    }
    
    console.log('\nProduct Popularity:');
    const popularProducts = await client.zRangeWithScores('product_popularity', 0, -1, { REV: true });
    console.log(popularProducts);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.quit();
  }
}

// Run examples
async function runExamples() {
  await pipelineTransactions();
  console.log('\n-----------------------\n');
  await ecommerceSystem();
}

runExamples();