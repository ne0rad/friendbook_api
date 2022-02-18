// chatroom model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChatroomSchema = new Schema({
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
    read: { type: Boolean, default: false }
});


module.exports = mongoose.model('Chatroom', ChatroomSchema, 'chatrooms');
