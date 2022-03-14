const express = require('express');
const app = express();
const http = require('http');
const logger = require('morgan');
const cors = require('cors');
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const mongoose = require('mongoose');

// MongoDB connection
const DEV_DB_URI = "mongodb://127.0.0.1:27017/friendbook";
mongoose.connect(process.env.MONGODB_URI || DEV_DB_URI, { useNewUrlParser: true });

var corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200
}

app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



server.listen(PORT, () => {
    console.log('\x1b[32m%s\x1b[0m', `[express] SERVER IS LISTENING ON *:${PORT}`);

});

exports.server = server;
exports.app = app;
