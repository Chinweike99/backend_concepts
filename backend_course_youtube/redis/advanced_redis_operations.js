import redis from 'redis'

const advancedRedisOperations = async() => {
    const client = redis.createClient({url: "redis://localhost:6379"});

    client.on("error", (error) =>{
        console.log("Error occured: ", error);
    })

    try {
        client.connect();

        // 1. Transactions
        //Start a transaction (no commands are executed until EXEC);
        const transaction = client.multi();
        // Queue up operations in the transaction
        transaction.set('transaction-key1', 'value1');
        transaction.incr("counter");
        transaction.hSet('user:200', {
            username: "alice",
            points: "50"
        });
        transaction.incr('counter');

        //Execute all commands automatically
        const results = await transaction.exec();
        console.log('Transaction results:', results)

        
        // 2.. PUB/SUB (Publish/Subscribe);
        // Create a separate subscriber client
        const subscriber = client.duplicate();
        await subscriber.connect();

        await subscriber.subscribe("notifications", (message) => {
            console.log("Recieved notification", message)
        });

        // Publish the message to the channel
        await client.publish('notifications', "Hello Syntax Sage");
        await client.publish('notifications', "Another Message for Syntax Sage");

        // Wait a moment to see the messages
        await new Promise(resolve => setTimeout(resolve, 1000));

        //Also close the duplicated connection
        await subscriber.unsubscribe('notifications')
        await subscriber.quit();
        console.log("Subscription done ✴️✴️");
        
        

        //3.. LUA SCRIPTING
        // Redis allows executing lua scripts for complex operations
        const script = `
            -- Get values for two keys
            local val1 = redis.call('GET', KEYS[1])
            local val2 = redis.call('GET', KEYS[2])

            -- Convert to numbers and compare
            val1 = tonumber(val1) or 0
            val2 = tonumber(val2) or 0

            -- Set the larger value to a third key
            if val1 > val2 then
                redis.call('SET', ARGV[1], val1)
                return val1
            else
                redis.call('SET', ARGV[1], val2)
                return val2
            end
        `;

        //Set up test values
        await client.set('num1', 42);
        await client.set('num2', 26);


        // Execute Lua Script
        const result = await client.eval(
            script, 
            {
                keys: ['num1', 'num2'],
                arguments: ['larger-number']
            }
        );

        console.log('Lua script result: ', result);
        console.log('Larger number stored', await client.get('larger-number'));


        // 4.. PIPELINE
        // Pipeline sends multiple commands at once without waiting for responses
        const pipeline = client.multi();

        // Queue up 1000 Set operations
        for(let i = 0; i < 300 ; i++){
            pipeline.set(`pipeline-key-${i}`, `value-${i}`);
        }
        console.time('pipeline');
        await pipeline.exec();
        console.timeEnd('pipeline');
        console.log('Pipeline done')



        // 5. Use Redis for distributed locks
        async function acquireLock(lockName, timeoutMs){
            //  NX = only set if Key does not exist, PX = Set Expiry in milliseconds
            const result = await client.set(`lock:${lockName}`, `locked`, {
                NX: true,
                PX: timeoutMs
            });
            return 'OK'
        }

        async function releaseLock(lockName){
            return await client.del(`lock:${lockName}`);
        }

        // Example usage of distributed lock
        const lockAcquired = await acquireLock('my-source', 10000);
        console.log('Lock acquired:', lockAcquired);

        if(lockAcquired){
            console.log('Performing Lock Operations ...');

            await new Promise(resolve => setTimeout(resolve, 1000));

            // Release the lock when done..
            await releaseLock('my-resource');
            console.log('Lock released');
        }

        client.quit();
        console.log("Redis operation done");
    } catch (error) {
        console.log("Error in Advanced Features", error)
    }
    
}

advancedRedisOperations();