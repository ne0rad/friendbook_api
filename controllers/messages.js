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

        User.findById(req.user._id)
            .exec((err, user) => {
                if (err) return next(err);
                if (!user) return res.status(404).json({ message: 'User not found.' });

                const message = new Message({
                    'chatroom': req.body.chatroom,
                    'author': user._id,
                    'message': req.body.message,
                    'date': Date.now(),
                    'read': false
                });

                Chatroom.findById(req.body.chatroom)
                    .exec((err, chatroom) => {
                        if (err) return next(err);
                        if (!chatroom) return res.status(404).json({ message: 'Chatroom not found.' });

                        chatroom.messages.push(message);
                        chatroom.save();
                        message.save();

                        var receiver = chatroom.members.filter(member => member.toString() !== user._id.toString());

                        // add notification to receivers
                        receiver.forEach(member => {
                            Notifications.findById(member)
                                .exec((err, notifications) => {
                                    if (err) return next(err);
                                    if (!notifications) {
                                        var notifications = new Notifications({
                                            user: member,
                                            alerts: [],
                                            chatrooms: [chatroom._id]
                                        });
                                        notifications.save();
                                    }

                                    var chatroom_index = notifications.chatrooms.indexOf(chatroom._id);

                                    if (chatroom_index === -1) {
                                        notifications.chatrooms.push(chatroom._id);
                                        notifications.save();
                                    } else {
                                        // set read to false
                                        notifications.chatrooms[chatroom_index].read = false;
                                        notifications.save();
                                    }

                                });
                        });

                        return res.status(200).json({ message: 'Message sent.' });
                    });
            });
    }
]

exports.get_messages = [
    body('chatroom').isLength({ min: 1 }).withMessage('Chatroom is required.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        Chatroom.findById(req.body.chatroom)
            .populate({
                path: 'messages',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            })
            .exec((err, chatroom) => {
                if (err) return next(err);
                if (!chatroom) return res.status(404).json({ message: 'Chatroom not found.' });

                return res.status(200).json({ messages: chatroom.messages });
            });
    }
]


exports.get_chatrooms = [
    (req, res, next) => {
        User.findById(req.user._id)
            .exec((err, user) => {
                if (err) return next(err);
                if (!user) return res.status(404).json({ message: 'User not found.' });

                Chatroom.find({ members: user._id })
                    .populate({
                        path: 'messages',
                        options: { sort: { 'date': -1 } },
                        populate: {
                            path: 'author',
                            select: 'username',
                            limit: 1
                        }
                    })
                    .populate({
                        path: 'members',
                        select: 'username'
                    })
                    .exec((err, chatrooms) => {
                        if (err) return next(err);
                        if (!chatrooms) return res.status(404).json({ message: 'Chatrooms not found.' });

                        return res.status(200).json({ chatrooms: chatrooms });
                    });
            });
    }
]

exports.load_older_messages = [
    body('chatroom').isLength({ min: 1 }).withMessage('Chatroom is required.'),
    body('message_count').isLength({ min: 1 }).withMessage('Message count is required.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        Chatroom.findById(req.body.chatroom)
            .populate({
                path: 'messages',
                options: { sort: { 'date': -1 } },
                populate: {
                    path: 'author',
                    select: 'username'
                }
                    .range([req.body.message_count, req.body.message_count + 20])
            })
            .exec((err, chatroom) => {
                if (err) return next(err);
                if (!chatroom) return res.status(404).json({ message: 'Chatroom not found.' });

                const messages = chatroom.messages.slice(req.body.message_count);

                return res.status(200).json({ messages: messages });
            });
    }
]
