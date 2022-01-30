const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.get_user = (req, res, next) => {
    const token = req.body.token;
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    User.findOne({ _id: decoded._id })
        .exec((err, user) => {
            if (err) return next(err);
            return res.status(200).json({
                username: user.username,
                email: user.email || null,
                firstname: user.firstname || null,
                lastname: user.lastname || null,
            })
        })
}