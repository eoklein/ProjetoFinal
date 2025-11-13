const express = require('express');
const userController = require('../controller/user');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post('/login', authMiddleware, userController.login);
router.post('/register', userController.register);

module.exports = router;
