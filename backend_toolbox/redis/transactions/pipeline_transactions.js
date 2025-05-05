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

pipelineTransactions();
