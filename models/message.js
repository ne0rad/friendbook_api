var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    to: { type: Schema.Types.ObjectId, ref: 'User' },
    from: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    read: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', MessageSchema, 'messages');
