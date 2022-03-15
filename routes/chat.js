const express = require('express');
const router = express.Router();

const { verify_token } = require('../verify_token');
const { all, create, join, send_message, read } = require('../controllers/chat');

// Require token with every request here.
router.use(verify_token);

router.get('/all', all);
router.post('/create', create);
router.post('/join', join);
router.post('/send_message', send_message);
router.post('/read', read);

module.exports = router;