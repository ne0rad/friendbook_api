const socketIO = require('socket.io');
const server = require('http').createServer();
server.listen(process.env.PORT || 4000, () => {
    console.log('\x1b[32m%s\x1b[0m', `Server listening on port ${process.env.PORT || 4000}`);
});

module.exports = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
