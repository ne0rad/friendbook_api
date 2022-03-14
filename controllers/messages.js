const User = require('../models/user');
const Message = require('../models/message');
const Chat = require('../models/chat');
const io = require('../socket');
const { body, validationResult } = require('express-validator');
var ObjectId = require('mongoose').Types.ObjectId;

exports.send_message = (user, data, callback) => {
    if (!data.message) {
        return callback('Invalid message.');
    }
    if (!data.chatroom || !data.chatroom.toString().match(/^[0-9a-fA-F]{24}$/)) {
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
                if (chatDB.messages.length > 99) chatDB.messages.shift();
                chatDB.messages.push(messageDB._id);
                chatDB.updated = Date.now();
                chatDB.lastMessage = messageDB._id;
                chatDB.readBy = [user._id];
                chatDB.save().then(() => {
                    chatDB.members.forEach(member => {
                        io.to(member._id).emit('message', { message: messageDB, chatroom: chatDB._id });
                    });
                    return callback(null, { message: messageDB });
                });
            }).catch(err => {
                return callback(err);
            });
        }
    });
}

exports.create_chat = [
    body('recepient')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Recepient username too short.')
        .isLength({ max: 50 })
        .withMessage('Recepient username too long.')
        .bail()
        .isAlphanumeric()
        .withMessage('Only letters and numbers.')
        .bail()
        .escape(),

    (req, res) => {

        User.findOne({ username: req.body.recepient }).then(recipientDB => {
            if (!recipientDB) {
                return res.status(401).send({ msg: 'Invalid recipient.' });
            } else {

                Chat.findOne({ members: { $all: [req.user._id, recipientDB._id] } }).then(chatDB => {
                    if (chatDB) {
                        return res.status(200).send({ chat: chatDB._id });
                    } else {
                        let chat = new Chat({
                            members: [req.user._id, recipientDB._id]
                        });
                        chat.save().then(chatDB => {
                            return res.status(200).send({ chat: chatDB._id });
                        })
                    }
                });
            }
        }).catch(() => {
            return res.status(401).send({ msg: "Database Error." });
        });

    }
];



exports.join_chat = (user, data, callback) => {
    if (!data.chatroom || !data.chatroom.toString().match(/^[0-9a-fA-F]{24}$/)) {
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

exports.get_chats = (req, res) => {
    Chat.find({ members: req.user._id })
        .populate({ path: 'members', select: 'username' })
        .populate('lastMessage')
        .sort({ updated: -1 })
        .then(chatsDB => {

            if (!chatsDB) {
                return res.status(404).send({ msg: 'No chats found.' });
            }

            // Make lastMessage max 20 characters long
            chatsDB.forEach(chatDB => {
                if (chatDB.lastMessage && chatDB.lastMessage.message.length > 20) {
                    chatDB.lastMessage.message = chatDB.lastMessage.message.substring(0, 20) + ' ...';
                }
            });

            return res.status(200).send({ chats: chatsDB });
        }).catch(err => {
            return res.status(401).send({ msg: "Database Error" });
        });
}

exports.read_chat = (user, data, callback) => {
    if (!data.chatroom || !data.chatroom.toString().match(/^[0-9a-fA-F]{24}$/)) {
        return callback('Invalid chatroom.');
    }

    Chat.findById(data.chatroom).then(chatDB => {
        if (!chatDB) {
            return callback('Invalid chatroom.');
        } else {
            let member = chatDB.members.find(member => member._id.toString() === user._id.toString());
            if (!member) {
                return callback('You are not a member of this chat.');
            } else {
                chatDB.readBy.push(user._id);
                chatDB.save().then(() => {
                    return callback(null, { chatroom: chatDB._id });
                });
            }
        }
    });
}
