const express = require('express');
const userController = require('../controller/user');
const authMiddleware = require('../middlewares/auth');
const loginValidationMiddleware = require('../middlewares/loginValidation');

const router = express.Router();

/**
 * POST /auth/login
 * Body: { "login": "username|email", "password": "password" }
 * Header: Authorization: Basic <base64(login:password)>
 * 
 * Suporta login por:
 * - Username único e case-sensitive
 * - Email único e case-insensitive
 * - Backward compatible com clientes antigos
 */
router.post('/login', loginValidationMiddleware, userController.login);
router.post('/register', userController.register);

module.exports = router;
