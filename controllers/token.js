var jwt = require('jsonwebtoken');

exports.verify_token = function (req, res, next) {
    jwt.verify(req.headers.authorization, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: 'Invalid token.'
            });
        }
        req.user = decoded;
        next();
    });
}
