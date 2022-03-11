const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.user_login = (data, cb) => {
    if (data.token) {
        jwt.verify(data.token, process.env.SECRET, (err, decoded) => {
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
                        userDB.token = jwt.sign(user, process.env.SECRET);
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

exports.user_signup = (data, callback) => {
    if (!data.username || !data.password || data.username.length < 3 || data.password.length < 3) {
        return callback('Invalid username or password.');
    }
    User.findOne({ username: data.username }).then(userDB => {
        if (userDB) {
            return callback('Username already exists.');
        } else {
            let user = new User({
                username: data.username,
                password: bcrypt.hashSync(data.password, 10),
                role: 0
            });
            user.token = jwt.sign({ username: user.username, _id: user._id }, process.env.SECRET);
            user.save().then(userDB => {
                return callback(null, { username: userDB.username, _id: userDB._id, token: userDB.token });
            }).catch(err => {
                return callback(err);
            });
        }
    });
}
