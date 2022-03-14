const express = require('express');
const router = express.Router();

const { verify_token } = require('../verify_token');
const { get_chats, create_chat } = require('../controllers/messages');

// Require token with every request here.
router.use(verify_token);

router.get('/get_chats', get_chats);
router.post('/create', create_chat);

module.exports = router;