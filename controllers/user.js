const User = require('../models/user');

exports.get_my_info = (req, res, next) => {

    User.findById(req.user._id)
        .exec((err, user) => {

            if (err) return next(err);
            if (!user) return res.status(404).json({ message: 'User not found.' });

            return res.status(200).json({
                username: user.username,
                email: user.email || null,
                firstname: user.firstname || null,
                lastname: user.lastname || null,
            })
        })
}

exports.update_my_info = (req, res, next) => {
    
        User.findById(req.user._id)
            .exec((err, user) => {

                if(err) return next(err);
                if(!user) return res.status(404).json({ message: 'User not found.' });

                user.username = req.body.username;
                user.email = req.body.email;
                user.firstname = req.body.firstname;
                user.lastname = req.body.lastname;
                user.save();
                
                return res.status(200).json({ message: 'User updated.' });
            });
}
