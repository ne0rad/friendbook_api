var express = require('express');
var router = express.Router();
const { createUser, loginUser } = require('../controllers/user');

router.post('/createUser', createUser);
router.post('/loginUser', loginUser);

module.exports = router;
