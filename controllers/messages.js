const User = require('../models/user');
const Message = require('../models/message');
const Chatroom = require('../models/chatroom');
const { body, validationResult } = require('express-validator');

exports.send = [
    body('message').isLength({ min: 1 }).withMessage('Message is required.'),
    body('chatroom').isLength({ min: 1 }).withMessage('Chatroom is required.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        const { message, chatroom } = req.body;
        const user = req.user._id;

        Chatroom.findById(chatroom)
            .exec((err, chatroom) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                }
                if (!chatroom) {
                    return res.status(404).json({
                        message: 'Chatroom not found.'
                    });
                }
                if (chatroom.members.indexOf(user) === -1) {
                    return res.status(401).json({
                        error: 'You are not a member of this chatroom.'
                    });
                }

                const newMessage = new Message({
                    chatroom: chatroom,
                    author: user,
                    message: message,
                    date: Date.now()
                });

                newMessage.save();
            });
    }
];

exports.create_chatroom = (req, res, next) => [
    body('recepient').isLength({ min: 1 }).withMessage('Recipient is required.'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        const { recepient } = req.body;

        User.findById(recepient)
            .exec((err, recepient) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                }
                if (!recepient) {
                    return res.status(404).json({
                        message: 'Recipient not found.'
                    });
                }

                const chatroom = new Chatroom({
                    members: [req.user._id, recepient._id]
                });

                chatroom.save();
            });
    }

]

exports.chatroom_messages = (req, res, next) => {
    const user = req.user._id;

    Chatroom.find({ members: user })
        .populate({
            path: 'members',
            select: '_id'
        })
        .exec((err, chatrooms) => {
            if (err) {
                return res.status(500).json({
                    error: err
                });
            }
            res.status(200).json(chatrooms);
        });
}
