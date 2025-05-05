// Advanced-subscriber.js
import redis from 'redis'

const subscriber = redis.createClient({url: "redis://localhost:6379"});

subscriber.on("error", (error) => {
    console.log("Error: ", error);
})

const startSubscriber = async() => {
    await subscriber.connect();

    //Subscribe to a specific channel
    await subscriber.subscribe("user:notifications", (message)=>{
        console.log(`User notification: ${message}`);
    });

    await subscriber.subscribe("system:alerts", (message) => {
        console.log(`System alert: ${message}`);
    });

    // SUbscribe to a pattern (any channel starting with "user:")
    await subscriber.pSubscribe("user:*", (message, channel)=> {
        console.log(`[${channel}] ${message}`)
    });

    console.log('Subscribed to channels and patterns')

}

startSubscriber();


