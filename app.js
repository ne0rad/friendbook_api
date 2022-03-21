require('dotenv').config();
const { app } = require('./server');
const io = require('./socket');
const { verify_token_socket } = require('./verify_token');

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/chat', require('./routes/chat'));

// Socket.IO connection
io.on("connection", (socket) => {
  console.log('\x1b[32m%s\x1b[0m', `[socket.io] Client connected (${socket.id})`);

  socket.on('chat_join', (data) => {
    verify_token_socket(data.token, (err, user) => {
      if (err) return;
      console.log('\x1b[32m%s\x1b[0m', `[socket.io] ${user.username} joined ChatID: ${data.chatID} (${socket.id})`);
      socket.join(data.chatID);
    });
  });

  socket.on('chat_leave', (data) => {
    verify_token_socket(data.token, (err, user) => {
      if (err) return;
      console.log('\x1b[31m%s\x1b[0m', `[socket.io] ${user.username} left ChatID: ${data.chatID} (${socket.id})`);
      socket.leave(data.chatID);
    });
  });

  socket.on("disconnect", () => console.log('\x1b[31m%s\x1b[0m', `[socket.io] Client disconnected (${socket.id})`));
});
