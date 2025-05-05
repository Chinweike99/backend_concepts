import redis from 'redis';

async function testingReddis(){
    const client = redis.createClient({
        url: 'redis://localhost:6379'
    });

    client.on("error", (err) => {
        console.error("Reddis Error: ", err);
    });

    try {
        await client.connect();
        console.log("Connected to redis successfully");

        // Test setting and getting a value
        await client.set("greeting", "Hello Syntax Sage from Redis");
        const value = await client.get("greeting");

        console.log("Retrieved Value: ", value);

        //close the connection
        await client.quit();
        console.log("Connection closed: ");
        
    } catch (error) {
        console.error(error);
    }
} 

testingReddis();