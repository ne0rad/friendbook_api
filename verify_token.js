var jwt = require('jsonwebtoken');

exports.verify_token = function (req, res, next) {
    jwt.verify(req.headers.authorization, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                msg: 'Invalid token.'
            });
        }
        req.user = decoded;
        next();
    });
}

exports.verify_token_socket = function (token, callback) {
    if(!token) return callback('Invalid token.');

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return callback('Invalid token.');
        }
        return callback(null, decoded);
    });
}
