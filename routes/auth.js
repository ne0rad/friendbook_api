var express = require('express');
var router = express.Router();
const { user_create, user_login } = require('../controllers/auth');

router.post('/create', user_create);
router.post('/login', user_login);

module.exports = router;
