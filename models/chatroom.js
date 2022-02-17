// chatroom model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChatroomSchema = new Schema({
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
});


module.exports = mongoose.model('Chatroom', ChatroomSchema, 'chatrooms');
