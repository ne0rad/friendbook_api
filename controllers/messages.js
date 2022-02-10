const User = require('../models/user');
const Message = require('../models/message');
const { body, validationResult } = require('express-validator');

exports.send = [
    body('receiver').custom(async (value, { req }) => {
        const user = await User.findById(value);
        if (!user) {
            throw new Error('User not found');
        }
        req.receiver = user;
        return true;
    }),
    body('message').custom((value, { req }) => {
        if (value.length > 500) {
            throw new Error('Message is too long');
        }
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        const message = new Message({
            to: req.receiver,
            from: req.user,
            message: req.body.message,
            date: Date.now(),
            read: false
        });
        message.save((err, message) => {
            if (err) return next(err);
            return res.status(200).json({ message: message });
        });
    }
]

exports.user = [
    body('receiver').custom(async (value, { req }) => {
        const user = await User.findById(value);
        if (!user) {
            throw new Error('User not found');
        }
        req.receiver = user;
        return true;
    }
    ),
    (req, res, next) => {
        Message.find({
            $or: [
                { to: req.user._id, from: req.receiver },
                { to: req.receiver, from: req.user._id }
            ]
        })
            .sort({ date: -1 })
            .limit(20)
            .exec((err, messages) => {
                if (err) return next(err);
                return res.status(200).json({ messages: messages });
            });
    }
]
