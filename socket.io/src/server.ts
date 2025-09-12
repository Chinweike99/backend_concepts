import { timeStamp } from 'console';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket: Socket) => {
    console.log("User connected", socket.id);

    // Handle basic messaging
    socket.on('message', (data: {text: string, to: string}) => {
        console.log("Message recieved: ", data);

        // Send to specific user if specified
        if(data.to){
            socket.to(data.to).emit('message', {
                text: data.text,
                from: socket.id
            })
        }else {
            socket.broadcast.emit('message',  {
                text: data.text,
                from: socket.id,
                timeStamp: new Date()
            })
        }
    })

    socket.on("disconnect", (reason) => {
    console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);
  });

     socket.on("connect_error", (err) => {
    console.error(`⚠️ Connection error for socket ${socket.id}:`, err.message);
  });
});


io.engine.on("connection_error", (err) => {
  console.error("🚨 Engine connection error:", {
    req: err.req,
    code: err.code, 
    message: err.message,
    context: err.context,
  });
});

app.get('/', (req: Request, res: Response) => {
    res.send("Hello Dear");
})

const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
//   console.log(io)
});