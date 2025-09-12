import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { userService } from './services/UserService';
import { JoinRoomData, Message } from './types';


const app = express();
app.use(express.json());

const httpServer = createServer(app);
const io = new Server (httpServer, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST']
    }
});


// Middleware to authenticate connections
io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if(!username){
        return next(new Error("Invalid username"))
    };
    next();
});


io.on('connection', (socket: Socket) => {
    const username = socket.handshake.auth.username;
    console.log("User connected:", socket.id, username);

    //Add user to service
    userService.addUser(socket.id, username);

    //Join room
    socket.on('join_room', (data: JoinRoomData) => {
        socket.join(data.room);
        const user = userService.getUser(socket.id);
        if(user){
            user.room = data.room;
            socket.to(data.room).emit("user_joined", {
                userId: socket.id,
                username: user.username
            });

            // Send current room users to new user
            const roomUsers = userService.getUsersInRoom(data.room);
            socket.emit("room_users", roomUsers)
        }
    });

    //Direct Message
    socket.on('direct_message', (data: {text: string, to: string}) => {
        const fromUser = userService.getUser(socket.id);
        const toUser = userService.getUser(data.to);

        if(fromUser && toUser){
            const message: Message = {
                id: Math.random().toString(36).substr(2, 9),
                text: data.text,
                from: socket.id,
                to: data.to,
                timestamp: new Date(),
                type: 'direct'
            };
             socket.to(data.to).emit('direct_message', message);
      socket.emit('message_delivered', { id: message.id });
        }
    })

      // Room messaging
  socket.on('room_message', (data: { text: string }) => {
    const user = userService.getUser(socket.id);
    
    if (user && user.room) {
      const message: Message = {
        id: Math.random().toString(36).substr(2, 9),
        text: data.text,
        from: socket.id,
        to: user.room,
        timestamp: new Date(),
        type: 'group'
      };
      
      socket.to(user.room).emit('room_message', message);
      socket.emit('message_delivered', { id: message.id });
    }
  });


  // Handle disconnection
  socket.on('disconnect', () => {
    const user = userService.getUser(socket.id);
    if (user && user.room) {
      socket.to(user.room).emit('user_left', {
        userId: socket.id,
        username: user.username
      });
    }
    userService.removeUser(socket.id);
    console.log('User disconnected:', socket.id);
  });

});


app.get('/users', (req, res) => {
  const users = Array.from(userService['users'].values());
  res.json(users);
});



app.get('/rooms/:room/users', (req, res) => {
  const roomUsers = userService.getUsersInRoom(req.params.room);
  res.json(roomUsers);
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
