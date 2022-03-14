require('dotenv').config();
const { app } = require('./server');
const io = require('./socket');

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/chat', require('./routes/chat'));

// Socket.IO connections logging
io.on("connection", (socket) => {
  console.log('\x1b[32m%s\x1b[0m', `[socket.io] Client connected (${socket.id})`);

  socket.on("disconnect", () => console.log('\x1b[31m%s\x1b[0m', `[socket.io] Client disconnected (${socket.id})`));
});
