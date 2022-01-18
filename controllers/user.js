const User = require('../models/user');
const { body, validationResult } = require('express-validator');

exports.createUser = [

    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username too short.')
        .bail()
        .isAlphanumeric()
        .withMessage('Only letters and numbers.')
        .bail()
        .escape()
        .custom(async function (value) {
            var existingUser = await User.exists({ username: value });
            if (existingUser === true) return Promise.reject();
            else return Promise.resolve();
        })
        .withMessage('Username already taken.'),

    body('password')
        .isLength({ min: 3, max: 50 })
        .withMessage('Password too short.')
        .escape(),

    (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            // Got errors, send them back to frontend
            let error = errors.array()[0];
            console.log(error);
            res.status(406).send({ error: error.param, message: error.msg });
            return;

        } else {

            const user = User({
                username: req.body.username,
                password: req.body.password,
                role: 0
            });
            user.save();
        }
    }
]
