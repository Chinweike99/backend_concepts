import redis from 'redis';


const publisher = redis.createClient({url: "redis://localhost:6379"});
publisher.on('error', (error) => {
    console.log("Error: ", error);
});

const startPublisher =  async() => {
    await publisher.connect();

    // Add delay to give subscriber time to connect
  console.log("Publisher connected, waiting 3 seconds before publishing...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  

    await publisher.publish("user:notifications", "New features available");
    await publisher.publish("system:alerts", "System Maintenance in 5 minutes");
    await publisher.publish("user:123:updates", ("Your Profile was viewed by your friend"));

    console.log("Publisher started");
    await publisher.quit();
}
startPublisher();

