// chat model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});


module.exports = mongoose.model('Chat', ChatSchema, 'chats');
