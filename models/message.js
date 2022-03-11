var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    author_id: { type: Schema.Types.ObjectId, ref: 'User' },
    author: { type: String },
    message: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema, 'messages');
