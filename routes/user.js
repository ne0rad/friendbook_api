var express = require('express');
var router = express.Router();

const { get_user } = require('../controllers/user');

router.get('/get_user', get_user);

module.exports = router;
