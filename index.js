const express = require('express');
const connectDb=require('./Config/db');
const dotEnv = require('dotenv');
const userRoutes = require('./Routes/userRoutes');
const chatRoutes = require('./Routes/chatRoutes');
const messageRoutes = require('./Routes/messageRoutes');
const cors = require ('cors')
const {notFound, errorHandler}=require('./middleware/errorMiddleware');
dotEnv.config();


const app = express();
app.use(cors());
app.use(express.json());
//Routes
app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/message',messageRoutes)

app.use(notFound);
app.use(errorHandler)
const PORT = process.env.PORT || 5000
connectDb();
// app.use(cors());
const server = app.listen(PORT,()=>{
    console.log(`port runnig on ${PORT}`)
});
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
      origin:"https://gupp-shupp-frontend.onrender.com"
      // credentials: true,
    },
  });
  
  io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    //socket to set id for looged in user.
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });
    //socket for joining chat room
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log('user join romm');
    });
    //for sending new message
    socket.on('new message',(newMessageRecieved)=>{
        // console.log('new message',newMessageRecieved)
        let chat = newMessageRecieved.chat;
        chat.users.forEach(user => {
            console.log(user._id,newMessageRecieved.sender._id);
            if(user._id == newMessageRecieved.sender._id)return;
            socket.in(user._id).emit('message recieved',newMessageRecieved);
        });
    });
    socket.on("typing", (room) => {
      console.log('typinggg------',room)
      socket.in(room).emit("typing")});
    socket.on("stop typing", (room) => {
      console.log('typinggg----stopppp--',room)
      socket.in(room).emit("stop typing")});
    
});