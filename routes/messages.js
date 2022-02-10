var express = require('express');
var router = express.Router();

const { verify_token } = require('../controllers/token');
const { send, user } = require('../controllers/messages');

// Every route here must have a valid token
router.use(verify_token);

router.post('/send', send);

router.get('/user', user);

module.exports = router;
