const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.user_login = (data, cb) => {
    if (data.token) {
        jwt.verify(data.token, process.env.TOKEN_SECRET, (err, decoded) => {
            if (err) return cb("Invalid token");
            return cb(null, decoded);
        });
    } else if (data.username && data.password) {
        User.findOne({ username: data.username }).then(userDB => {
            if (!userDB) {
                return cb('Invalid username or password.');
            } else {
                if (bcrypt.compareSync(data.password, userDB.password)) {
                    let user = { username: userDB.username, _id: userDB._id };
                    if (!userDB.token) {
                        userDB.token = jwt.sign(user, process.env.TOKEN_SECRET);
                        userDB.save();
                    }
                    user.token = userDB.token;
                    return cb(null, user);
                } else {
                    return cb('Invalid username or password.');
                }
            }
        });
    } else {
        return cb('Invalid username or password.');
    }
}
