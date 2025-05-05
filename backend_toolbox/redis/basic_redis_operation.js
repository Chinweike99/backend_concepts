import redis from "redis";

const basicRedisOperation = async() => {
    const client = redis.createClient({url: "redis://localhost:6379"});

    client.on("error", (error) => {
        console.log("An Error occured during connection: ", error)
    });

    try {
        await client.connect();

        await client.set("greeting", "Hello Redis");
        console.log("string value set");

        const greeting = await client.get("greeting");
        console.log(greeting);


        // Check if key exists
        const exists = await client.exists("greeting");
        console.log("Does greeting exists?", exists === 1);

        // Delete a key
        await client.del("greeting");
        console.log("Key deleted")

        // Set an Expiration time
        await client.setEx("temporay", 10, "This is a temporary value");
        console.log("Set temporary key with 10-seconds expiration");

        // TTL: Checking remaining time-to-live for a key
        const ttl = await client.ttl("temporary");
        console.log("Time remaining", ttl);

        // INCR/DECR: Increament and Decreament counter
        await client.set('counter', 10);
        const increament = await client.incr("counter");
        console.log("Increament counter: ", increament);
        console.log("Increament counter: ", increament);

        const decreament = await client.decr("counter");
        console.log("Decreament counter", decreament);

        // MSET/MGET: set and get multiple;
        await client.mSet(["key1", "value1", "key2", "value2", "key3", "value3"]);
        const getMSet =  await client.mGet(["key1", "key2", "key3"]);
        console.log("Multiple values: ",getMSet)



        await client.quit();
        console.log("Redis closed")
    } catch (error) {
        console.log("error: ", error)
    }

};

basicRedisOperation();