import express from 'express';
import http from 'http';
import redis from 'redis';
import {Server} from 'socket.io'

// Setup express and socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

//Redis client
const subscriber = redis.createClient({url: "redis://localhost:6379"});
const publisher = redis.createClient({url: "redis://localhost:6379"});

// Connect redis client
const connectRedisClient = async() => {
    await subscriber.connect();
    await publisher.connect();

    console.log("Redis client connected")

    await subscriber.pSubscribe('chat:room:*', (message, channel) => {
        // Extract room name from channel (e.g., 'chat:room:general' -> 'general')
        const roomName = channel.split(':')[2];
        
        // Parse message (assuming JSON format)
        const msgData = JSON.parse(message);
        
        // Broadcast to all clients in that room using Socket.io
        io.to(roomName).emit('chat message', {
          username: msgData.username,
          message: msgData.message,
          timestamp: msgData.timestamp
        });
      });
};

connectRedisClient().catch(console.error);


// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected');
    
    // Handle joining rooms
    socket.on('join room', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
      
      // Notify room about new user
      publishMessage('system', `A new user has joined ${room}`, room);
    });
    
    // Handle chat messages
    socket.on('chat message', async (data) => {
      const { username, message, room } = data;
      
      // Publish message to Redis
      await publishMessage(username, message, room);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // Helper function to publish messages
async function publishMessage(username, message, room) {
    const msgData = {
      username,
      message,
      timestamp: Date.now()
    };
    
    await publisher.publish(`chat:room:${room}`, JSON.stringify(msgData));
  }
  
  // Start server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await subscriber.quit();
    await publisher.quit();
    process.exit();
  });
  


