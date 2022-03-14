const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = [

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
            const error = errors.errors[0];
            res.status(406).send({ param: error.param, msg: error.msg });
            return;

        } else {

            let salt = bcrypt.genSaltSync(10);
            let hashedPassword = bcrypt.hashSync(req.body.password, salt);

            const user = User({
                username: req.body.username,
                password: hashedPassword,
                role: 0
            });
            user.save((err, user) => {
                if (err) return next(err);
                const token = jwt.sign({ username: user.username, _id: user._id }, process.env.SECRET);
                user.token = token;
                user.save();
                return res.status(200).send({ username: user.username, token: token });
            });
        }
    }
]

exports.login = [
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
            const error = errors.array()[0];
            res.status(406).send({ param: error.param, msg: error.msg });
            return;

        } else {

            User.findOne({ username: req.body.username })
                .exec((err, user) => {
                    if (err) return next(err);
                    const errorMsg = { param: "password", msg: "Invalid username or password." };
                    if (!user) return res.status(401).send(errorMsg);

                    bcrypt.compare(req.body.password, user.password, function (err, result) {
                        if (err) return next(err);
                        if (!result) {
                            return res.status(401).send(errorMsg);
                        }

                        // All good, let's login
                        if (user.token) {
                            return res.status(200).send({ username: user.username, token: user.token });
                        } else {
                            const token = jwt.sign({ username: user.username, _id: user._id }, process.env.SECRET);
                            user.token = token;
                            user.save().then(() => {
                                return res.status(200).send({ username: user.username, token: token });
                            })
                        }
                    });


                })
        }
    }
]

exports.token_login = (req, res) => {
    if(!req.body.token) return res.status(401);
    jwt.verify(req.body.token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: 'Invalid token.'
            });
        }
        req.user = decoded;
        res.status(200).send({ username: decoded.username, token: req.body.token })
    });
}
