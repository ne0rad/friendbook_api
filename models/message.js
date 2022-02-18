var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    chatroom: { type: Schema.Types.ObjectId, ref: 'Chatroom' },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema, 'messages');
