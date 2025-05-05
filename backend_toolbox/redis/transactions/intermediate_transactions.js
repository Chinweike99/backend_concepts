import redis from 'redis'


async function bankTransfer(){
    const client = redis.createClient({url: "redis://localhost:6379"});
    client.on("error", (error)=> {
        console.log("Redis error occured: ", error)
    });

    client.connect();

    try {
        // Initialize accounts
        await client.set("account:a:balance", "10000");
        await client.set("account:b:balance", '500');

        console.log("Initial balances");
        console.log("Account A:", await client.get("account:a:balance"));
        console.log("Account B:", await client.get("account:b:balance"));

        // Transfer $200 from account A to account B
        const transferAmount = 200;

        // Start transaction
        const transaction = client.multi()

        // Deduct from account A
        transaction.decrBy("account:a:balance", transferAmount);

        // Add to account B
        transaction.incrBy("account:b:balance", transferAmount);

        // Record the transfer in a list
        const transactionLog = {
            from: 'account:a',
            to: 'account:b',
            amount: transferAmount,
            timeStamp: Date.now(),
        };

        transaction.lPush('transfer_logs', JSON.stringify(transactionLog));

        // Execute the transaction
        await transaction.exec();

        console.log('\nAfter transfer:');
    console.log('Account A:', await client.get('account:a:balance'));
    console.log('Account B:', await client.get('account:b:balance'));
    
    // Get the transfer log
    const logs = await client.lRange('transfer_logs', 0, 0);
    console.log('\nTransfer log:', JSON.parse(logs[0]));
        



    } catch (error) {
        
    }finally{
        await client.quit();
        console.log("Redis Ended")
    }


}

bankTransfer();