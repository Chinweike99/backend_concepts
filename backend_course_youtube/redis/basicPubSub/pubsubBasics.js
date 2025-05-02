import redis from 'redis'

const subscriber = redis.createClient({url: "redis://localhost:6379"});
subscriber.on("error", (error)=> {
    console.log("An error occured on subscription", error);
})

const startSubscriber = async()=>{
    await subscriber.connect();

    await subscriber.subscribe("notifications", (message)=> {
        console.log("Notification: ", message)
    });
    console.log("Subscribed to notifications channel")

    subscriber.quit();
};

startSubscriber();