const express = require('express');
const router = express.Router();

const { login, signup, token_login } = require('../controllers/auth');

router.post('/login', login);
router.post('/signup', signup);
router.post('/token_login', token_login);

module.exports = router;
