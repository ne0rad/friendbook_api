const User = require('../models/user');
const Message = require('../models/message');
const Chat = require('../models/chat');
const { body, validationResult } = require('express-validator');

exports.send = [
    body('message').isLength({ min: 1 }).withMessage('Message is required.'),
    body('chatID').isLength({ min: 1 }).withMessage('ChatID is required.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        User.findById(req.user._id).then(user => {
            if (!user) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }

            Chat.findById(req.body.chatID).then(chat => {
                if (!chat) {
                    return res.status(404).json({
                        message: 'Chat not found.'
                    });
                }

                if (!chat.members.includes(user._id)) {
                    return res.status(401).json({
                        message: 'User not in chat.'
                    });
                }

                const message = new Message({
                    author: user._id,
                    message: req.body.message,
                    date: Date.now()
                })

                message.save().then(message => {
                    chat.messages.push(message._id);
                    chat.save().then(() => {
                        res.status(200).json({
                            message: 'Message sent.'
                        });
                    });
                });
            });
        });
    }];

exports.create_chat = [
    body('members')
        .isLength({ min: 1 })
        .withMessage('Members are required.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        User.findById(req.user._id).then(user => {
            if (!user) {
                return res.status(404).json({
                    message: 'User not found.'
                });
            }

            const members = JSON.parse(req.body.members).map(member => {
                User.findOne({ username: member }).then(memberUser => {
                    if (!memberUser) {
                        return res.status(404).json({
                            message: 'User not found.'
                        });
                    }

                    if (memberUser._id.equals(user._id)) {
                        return res.status(401).json({
                            message: 'User cannot be in chat with himself.'
                        });
                    }

                    if (user.chats.includes(memberUser._id)) {
                        return res.status(401).json({
                            message: 'User already in chat.'
                        });
                    }

                    member = memberUser._id;
                });
            });

            const chat = new Chat({
                members: [...members, user._id],
                messages: [],
                readBy: []
            });

            chat.save().then(chat => {
                res.status(200).json({
                    message: 'Chat created.',
                    chatID: chat._id
                });
            });
        });
    }
];
