const socketIO = require('socket.io');
const { server } = require('./server');

module.exports = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
