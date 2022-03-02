var express = require('express');
var router = express.Router();

const { verify_token } = require('../controllers/token');
const { send } = require('../controllers/messages');

// Every route here must have a valid token
router.use(verify_token);

router.post('/send', send);

module.exports = router;
