
import redis from "redis";

const publisher = redis.createClient({url: "redis://localhost:6379"})

publisher.on("error", (error)=> {
    console.log("An error occured on publishing: ", error);
})



const startPublisher = async()=>{
    await publisher.connect();

    //Publish a simple message
    await publisher.publish("notifications", "Hello Redis Pub/Sub");
    console.log("Message published to notifications successfully")

    await publisher.quit()
};

startPublisher();