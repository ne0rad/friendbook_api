const User = require('../models/user');
const Message = require('../models/message');
const Chat = require('../models/chat');
const io = require('../socket');
const { body, validationResult } = require('express-validator');
var ObjectId = require('mongoose').Types.ObjectId;

function isObjectIdValid(id) {
    if (ObjectId.isValid(id)) {
        if (String(new ObjectId(id)) === id) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

exports.send_message = [
    body('message')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Message is required.'),
    body('chatID')
        .trim()
        .custom((chat) => {
            if (!isObjectIdValid(chat)) {
                throw new Error('Invalid chatroom.');
            }
            return true;
        }),

    (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = errors.array()[0];
            return res.status(422).json({ msg: error.msg });
        }

        Chat.findById(req.body.chatID).then(chatDB => {
            if (!chatDB) {
                return res.status(404).send({ msg: 'Chat not found.' });
            } else {
                let message = new Message({
                    message: req.body.message,
                    author_id: req.user._id,
                    author: req.user.username,
                    date: Date.now()
                });
                message.save().then(messageDB => {
                    if (chatDB.messages.length > 99) chatDB.messages.shift();
                    chatDB.messages.push(messageDB._id);
                    chatDB.updated = Date.now();
                    chatDB.lastMessage = messageDB._id;
                    chatDB.readBy = [req.user._id];

                    chatDB.save().then(() => {
                        io.to(chatDB._id.toString()).emit('message', { message: messageDB, chatID: chatDB._id });
                        return res.status(200).send({ message: messageDB });
                    });

                }).catch(err => {
                    return res.status(401).send({ msg: "Database Error" });
                });
            }
        });
    }
]

exports.create = [
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
                        if (chatDB.readBy.indexOf(req.user._id) === -1) {
                            chatDB.readBy.push(req.user._id);
                            chatDB.save();
                        }
                        return res.status(200).send({ chatID: chatDB._id });
                    } else {
                        let chat = new Chat({
                            members: [req.user._id, recipientDB._id],
                            messages: [],
                            readBy: [req.user._id, recipientDB._id],
                            lastMessage: null,
                        });
                        chat.save().then(chatDB => {
                            return res.status(200).send({ chatID: chatDB._id });
                        })
                    }
                });
            }
        }).catch(() => {
            return res.status(401).send({ msg: "Database Error." });
        });

    }
];



exports.join = (req, res) => {
    if (!req.body.chatID || !isObjectIdValid(req.body.chatID)) {
        return res.status(401).send({ msg: "Invalid chatID." });
    }

    Chat.findById(req.body.chatID)
        .populate({ path: 'members', select: 'username' })
        .populate('messages')
        .then(chatDB => {
            if (!chatDB) {
                return res.status(404).send({ msg: 'Chat not found.' });
            } else {
                const member = chatDB.members.find(member => member._id.toString() === req.user._id.toString());
                if (!member) {
                    return res.status(401).send({ msg: 'You are not a member of this chat.' });
                } else {
                    if (chatDB.readBy.indexOf(req.user._id) === -1) {
                        chatDB.readBy.push(req.user._id);
                    }
                    chatDB.save().then(() => {
                        return res.status(200).send({
                            chatID: chatDB._id,
                            messages: chatDB.messages,
                            members: chatDB.members
                        });
                    });
                }
            }
        });
}

exports.all = (req, res) => {
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

exports.read = (req, res) => {
    if (!req.body.chatID || !isObjectIdValid(req.body.chatID)) {
        return res.status(401).send({ msg: "Invalid chatID." });
    }

    Chat.findById(req.body.chatID).then(chatDB => {
        if (!chatDB) {
            return res.status(404).send({ msg: 'Chat not found.' });
        } else {
            let member = chatDB.members.find(member => member._id.toString() === req.user._id.toString());
            if (!member) {
                return res.status(401).send({ msg: 'You are not a member of this chat.' });
            } else {
                if (chatDB.readBy.indexOf(req.user._id) === -1) {
                    chatDB.readBy.push(req.user._id);
                    chatDB.save();
                } else {
                    return res.status(200).send({ msg: 'Chat already read.' });
                }
            }
        }
    });
}
