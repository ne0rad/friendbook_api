var express = require('express');
var router = express.Router();

const { verify_token } = require('../controllers/token');
const { send, get_messages } = require('../controllers/messages');

// Every route here must have a valid token
router.use(verify_token);

router.post('/send', send);

router.get('/get_messages', get_messages);

module.exports = router;
