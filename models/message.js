var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    date: { type: Date, required: true }
});

module.exports = mongoose.model('Message', MessageSchema, 'messages');
