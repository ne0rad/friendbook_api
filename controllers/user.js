const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

exports.createUser = [

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
            res.status(406).send({ error: error.param, message: error.msg });
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

exports.loginUser = [
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
            res.status(406).send({ error: error.param, message: error.msg });
            return;

        } else {
            User.findOne({ username: req.body.username })
                .exec((err, user) => {
                    if (err) return next(err);
                    if (!user) return res.status(404).send({ error: "username", message: "User not found." });

                    bcrypt.compare(req.body.password, user.password, function (err, result) {
                        if (err) return next(err);
                        if (!result) {
                            return res.status(406).send({ error: "password", message: "Wrong password." });
                        }
                        // All good, let's login
                        res.sendStatus(200);
                        return;
                    });


                })
        }
    }
]
