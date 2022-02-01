const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.user_create = [

    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username too short.')
        .bail()
        .isLength({ max: 50 })
        .withMessage('Username too long.')
        .bail()
        .isAlphanumeric()
        .withMessage('Only letters and numbers.')
        .bail()
        .escape()
        .custom(async function (value) {
            const existingUser = await User.exists({ username: { "$regex": value, "$options": "i" } });
            if (existingUser) return Promise.reject();
            else return Promise.resolve();
        })
        .withMessage('Username already taken.'),

    body('password')
        .isLength({ min: 3 })
        .withMessage('Password too short.')
        .bail()
        .isLength({ max: 50 })
        .withMessage('Password too long.')
        .escape(),

    (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            // Got errors, send them back to frontend
            const error = errors.array()[0];
            res.status(406).send({ loc: error.param, message: error.msg });
            return;

        } else {
            let salt = bcrypt.genSaltSync(10);
            let hashedPassword = bcrypt.hashSync(req.body.password, salt);

            const user = User({
                username: req.body.username,
                password: hashedPassword,
                role: 0
            });
            user.save();
            res.sendStatus(200);
            return;
        }
    }
]

exports.user_login = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username too short.')
        .isLength({ max: 50 })
        .withMessage('Username too long.')
        .bail()
        .isAlphanumeric()
        .withMessage('Only letters and numbers.')
        .bail()
        .escape(),

    body('password')
        .isLength({ min: 3 })
        .withMessage('Password too short.')
        .isLength({ max: 50 })
        .withMessage('Password too long.')
        .escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            // Got errors, send them back to frontend

            const error = errors.array()[0];
            res.status(406).send({ loc: error.param, message: error.msg });
            return;

        } else {
            User.findOne({ username: req.body.username })
                .exec((err, user) => {
                    if (err) return next(err);
                    const errorMsg = { loc: "password", message: "Invalid username or password." };
                    if (!user) return res.status(401).send(errorMsg);

                    bcrypt.compare(req.body.password, user.password, function (err, result) {
                        if (err) return next(err);
                        if (!result) {
                            return res.status(401).send(errorMsg);
                        }
                        // All good, let's login
                        const token = jwt.sign({ username: user.username, _id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '5d' });
                        return res.status(200).json({ token: token });
                    });


                })
        }
    }
]
