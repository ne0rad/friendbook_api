require('dotenv').config();
var mongoose = require('mongoose');
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { user_login } = require("./controllers/auth");

// MongoDB connection
const DEV_DB_URI = "mongodb://127.0.0.1:27017/friendbook";
mongoose.connect(process.env.MONGODB_URI || DEV_DB_URI, { useNewUrlParser: true });


const port = process.env.PORT || 4000;
const app = express();

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  let user = false;
  console.log('\x1b[32m%s\x1b[0m', `[socket.io] Client connected.`);

  // Handle user login
  socket.on('login', (data, callback) => {
    if(!callback) return;
    if(user) return callback('You are already logged in.');
    user_login(data, (err, res) => {
      if(err) {
        callback(err);
      } else {
        user = res;
        callback(null, user);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log('\x1b[31m%s\x1b[0m', `[socket.io] Client disconnected.`);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
