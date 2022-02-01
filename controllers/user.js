const User = require('../models/user');

exports.get_my_info = (req, res, next) => {

    User.findById(req.user._id)
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