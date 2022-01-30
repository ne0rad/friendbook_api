var express = require('express');
require('dotenv').config();
var path = require('path');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var userRouter = require('./routes/user');


// MongoDB connection
const DEV_DB_URI = "mongodb://127.0.0.1:27017/friendbook";
mongoose.connect(process.env.MONGODB_URI || DEV_DB_URI, { useNewUrlParser: true });

var app = express();

var corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200
}


app.use(logger('dev'));
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);

module.exports = app;
