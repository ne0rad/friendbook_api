var express = require('express');
var router = express.Router();
const { createUser } = require('../controllers/user');

router.post('/createUser', createUser);

module.exports = router;
