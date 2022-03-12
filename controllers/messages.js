const User = require('../models/user');
const Message = require('../models/message');
const Chat = require('../models/chat');
const io = require('../socket');
const chat = require('../models/chat');

exports.send_message = (user, data, callback, socket) => {
    if (!data.message) {
        return callback('Invalid message.');
    }
    if (!data.chatroom || !data.chatroom.match(/^[0-9a-fA-F]{24}$/)) {
        return callback('Invalid chatroom.');
    }

    Chat.findById(data.chatroom).then(chatDB => {
        if (!chatDB) {
            return callback('Invalid chatroom.');
        } else {
            let message = new Message({
                message: data.message,
                author_id: user._id,
                author: user.username,
                date: Date.now()
            });
            message.save().then(messageDB => {
                chatDB.messages.push(messageDB._id);
                chatDB.updated = Date.now();
                chatDB.lastMessage = messageDB._id;
                chatDB.readBy = [user._id];
                chatDB.save().then(() => {
                    chatDB.members.forEach(member => {
                        io.to(member._id.toString()).emit('message', { message: messageDB, chatroom: chatDB._id });
                    });
                    return callback(null, { message: messageDB });
                });
            }).catch(err => {
                return callback(err);
            });
        }
    });
}

exports.create_chat = (user, data, callback) => {
    if (!data.recipient) {
        return callback('Invalid recipient.');
    }
    else if (data.recipient === user.username) {
        return callback('You cannot chat with yourself.');
    } else {

        User.findOne({ username: data.recipient }).then(recipientDB => {
            if (!recipientDB) {
                return callback('Invalid recipient.');
            } else {

                Chat.findOne({ members: { $all: [user._id, recipientDB._id] } }).then(chatDB => {
                    if (chatDB) {
                        return callback(null, { chatroom: chatDB._id });
                    } else {
                        let chat = new Chat({
                            members: [user._id, recipientDB._id]
                        });
                        chat.save().then(chatDB => {
                            return callback(null, { chatroom: chatDB._id });
                        })
                    }
                });
            }
        }).catch(err => {
            return callback(err);
        });
    }
}

exports.join_chat = (user, data, callback) => {
    if (!data.chatroom || !data.chatroom.match(/^[0-9a-fA-F]{24}$/)) {
        return callback('Invalid chatroom.');
    }

    Chat.findById(data.chatroom)
        .populate({ path: 'members', select: 'username' })
        .populate('messages')
        .then(chatDB => {
            if (!chatDB) {
                return callback('Invalid chatroom.');
            } else {
                let member = chatDB.members.find(member => member._id.toString() === user._id.toString());
                if (!member) {
                    return callback('You are not a member of this chat.');
                } else {
                    chatDB.readBy.push(user._id);
                    chatDB.save().then(() => {
                        return callback(null, { chatroom: chatDB._id, messages: chatDB.messages, members: chatDB.members });
                    });
                }
            }
        });
}

exports.get_chats = (user, data, callback) => {
    Chat.find({ members: user._id })
        .populate({ path: 'members', select: 'username' })
        .populate('lastMessage')
        .sort({ updated: -1 })
        .then(chatsDB => {

            // Make lastMessage max 20 characters long
            chatsDB.forEach(chatDB => {
                if (chatDB.lastMessage && chatDB.lastMessage.message.length > 20) {
                    chatDB.lastMessage.message = chatDB.lastMessage.message.substring(0, 20) + ' ...';
                }
            });

            return callback(null, { chatrooms: chatsDB });
        }).catch(err => {
            return callback(err);
        });
}
