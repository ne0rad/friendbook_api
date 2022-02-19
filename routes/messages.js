var express = require('express');
var router = express.Router();

const { verify_token } = require('../controllers/token');
const { send, create_chatroom, chatroom_messages } = require('../controllers/messages');

// Every route here must have a valid token
router.use(verify_token);

router.post('/send', send);
router.post('/create_chatroom', create_chatroom);

router.get('/chatroom_messages', chatroom_messages);

module.exports = router;
