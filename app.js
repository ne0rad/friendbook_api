require('dotenv').config();
var mongoose = require('mongoose');
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

// Import controllers
const { user_login, user_signup } = require("./controllers/auth");
const { send_message, create_chat, join_chat, get_chats } = require("./controllers/messages");

// MongoDB connection
const DEV_DB_URI = "mongodb://127.0.0.1:27017/friendbook";
mongoose.connect(process.env.MONGODB_URI || DEV_DB_URI, { useNewUrlParser: true });


const port = process.env.PORT || 4000;
const app = express();

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  let user = false;
  console.log('\x1b[32m%s\x1b[0m', `[socket.io] Client connected.`);

  function execute(func, data, callback) {
    if (user && data && callback) {
      func(user, data, (err, res) => {
        if (err) {
          callback(err);
        } else {
          callback(null, res);
        }
      });
    } else {
      callback("You must be logged in to do that.");
    }
  }

  // Handle user login
  socket.on('login', (data, callback) => {
    if (!data || !callback) return;
    if (user) return callback(null, user);
    user_login(data, (err, res) => {
      if (err) return callback(err);
      user = res;
      callback(null, user);
    });
  });

  // Handle user signup
  socket.on('signup', (data, callback) => {
    if (!data || !callback) return;
    if (user) return callback(null, user);
    user_signup(data, (err, res) => {
      if (err) return callback(err);
      callback(null, res);
    })
  });

  // Commands for logged in users
  // ----------------------------
  socket.on('send_message', (data, callback) => execute(send_message, data, callback));
  socket.on('create_chat', (data, callback) => execute(create_chat, data, callback));
  socket.on('join_chat', (data, callback) => execute(join_chat, data, callback));
  socket.on('get_chats', (data, callback) => execute(get_chats, data, callback));
  // ----------------------------
  // End of commands for logged in users

  socket.on("disconnect", () => {
    console.log('\x1b[31m%s\x1b[0m', `[socket.io] Client disconnected.`);
    user = false;
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
