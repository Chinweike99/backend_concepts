import redis from 'redis'
import express from 'express';


const startApiServer = async () => {

    // Connect to redis
    const client = redis.createClient({ url: 'redis://localhost:6379' });
    client.on("error", (error) => {
        console.log("Redis error: ", error);
    });

    await client.connect();


    // create Express server
    const app = express();
    app.use(express.json());

    // Rate limiting middleware;
    const rateLimiter = async (req, res, next) => {
        const ip = req.ip;
        const key = `rate:${ip}`;

        // Get current count for this IP
        let count = await client.get(key);
        count = count ? parseInt(count) : 0;

        if (count >= 100) {
            return res.status(429).json({ error: "Too many requests" });
        }

        // Increament counter and set expiry if it's new
        const pipeline = client.multi();
        pipeline.incr(key);
        if (count === 0) {
            pipeline.expire(key, 60) // Reset after 60 seconds
        }
        await pipeline.exec();
        next();
    }

    // Function to cache API responses
    async function withCache(req, res, next) {
        const cacheKey = `cache:${req.originalUrl}`;

        // Try to get from cache
        const cachedResponse = await client.get(cacheKey);

        if (cachedResponse) {
            //update access statistics
            await client.zIncrBy('popular:endpoints', 1, req.originalUrl);
            return res.json(JSON.parse(cachedResponse));
        }
        //store the original res.json function
        const originalJson = res.json;

        //override res.json to cache the response before sending
        res.json = async function (data) {
            try {
                // store in cache with 5 minutes expiry
                await client.setEx(cacheKey, 300, JSON.stringify(data));

                //Track endpoint access
                await client.zIncrBy('popular:endpoints', 1, req.originalUrl);

                // call the original json method
                return originalJson.call(this, data);

            } catch (error) {
                console.error("cached error: ", error);
                return originalJson.call(this, data)
            }
        };
        next();
    }

    // Apply middleware to all routes;
    app.use(rateLimiter);

    // Product data store
    const products = {
        '1': { id: '1', name: 'laptop', price: 999 },
        '2': { id: '2', name: 'Smartphonw', price: 699 },
        '3': { id: '3', name: 'Headphones', price: 199 },
    };


    //API Routes
    app.get('/api/products', withCache, (req, res) => {
        // Simulate slow database query
        setTimeout(() => {
            res.json(Object.values(products));
        }, 100)
    });


    app.get('/api/products/:id', withCache, (req, res) => {
        const product = products[req.params.id];

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        };

        // Record this product view in a sorted set (for trending products);
        client.zIncrBy("trending:products", 1, req.params.id);

        //Simulate database query
        setTimeout(() => {
            res.json(product);
        }, 50)
    });

    // Add Product to cart (using Redis hash and list)
    app.post('/api/cart', async (req, res) => {
        const { userId, productid, quantity } = req.body;
        if (!userId || !productid || !quantity) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const product = products[productid];
        if (!product) {
            return res.status(404).json({ error: "Products not found" });
        }

        // Transaction to update cart
        const transaction = client.multi();

        //store cart item details in a hash
        const cartItemKey = `cart:${userId}:${productid}`;
        transaction.hSet(cartItemKey, {
            productid,
            name: product.name,
            price: product.price,
            quantity
        });

        //Add to users cart List if not already
        transaction.sAdd(`user:${userId}:cartItems`, productid);

        // Keep track of cart update time
        transaction.set(`cartUpdated:${userId}`, Date.now())
        await transaction.exec();
        res.json({ success: true, message: "product added to cart" });
    });


    app.get('/api/cart/:userId', async (req, res) => {
        const { userId } = req.params;

        // Get all products IDS in user's cart
        const productIds = await client.sMembers(`user:${userId}:cartItems`);

        if (!productIds.length) {
            return res.json({ items: [], total: 0 });
        };

        const cartItems = [];
        let total = 0;
        for (let productid of productIds) {
            const itemData = await client.hGetAll(`cart:${userId}:${productid}`);
            if (itemData && Object.keys(itemData).length) {
                itemData.price = parseFloat(itemData.price);
                itemData.quantity = parseInt(itemData.quantity);

                const itemTotal = itemData.price * itemData.quantity;
                total += itemTotal;

                cartItems.push({
                    ...itemData,
                    total: itemTotal
                });
            }
        }

        res.json({
            items: cartItems,
            total
        });

    });


    app.get('/api/analytics/trending', async(req, res)=> {
        //Get top 5 trending products with their view counts
        const trending = await client.zRangeWithScores('trendin:products', 0, 4, {REV: true});
        const result = [];
        for(const {value, score} of trending){
            const product = products[value];
            if(product){
                result.push({
                    ...product,
                    views: score
                })
            }
        }
        res.json(result);
    })




    app.listen(3000, () => {
        console.log("Listening on PORT 3000")
    })

    //Setup cleanup
    process.on('SIGINT', async()=> {
        await client.quit();
        process.exit(0)
    });

}

startApiServer().catch(console.error);