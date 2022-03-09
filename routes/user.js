var express = require('express');
var router = express.Router();

const { verify_token } = require('../controllers/token');
const { get_my_info, update_my_info, notifications } = require('../controllers/user');

// Every route here must have a valid token


router.get('/get_my_info', get_my_info);
router.post('/update_my_info', update_my_info);
router.get('/notifications', notifications);

module.exports = router;
