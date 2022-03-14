const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
    res.send(`
    <center>
        <h1>
            FriendBook API server
        </h1>
        <h3>
            <a href="https://github.com/ne0rad/friendbook_api">GitHub</a>
        </h3>
    </center>
    `);
});

module.exports = router;
