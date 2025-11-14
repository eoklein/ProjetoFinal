const express = require('express');
const userController = require('../controller/user');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// GET /users/check/availability - SEM autenticação (verificar antes de cadastrar)
router.get('/check/availability', userController.checkAvailability);

// Todas as outras rotas requerem autenticação
router.use(authMiddleware);

// GET /users - Listar todos os usuários (requer admin)
router.get('/', adminMiddleware, userController.getUsers);

// GET /users/:id - Buscar usuário por ID (requer admin)
router.get('/:id', adminMiddleware, userController.getUserById);

// DELETE /users/:id - Deletar usuário (requer admin)
router.delete('/:id', adminMiddleware, userController.deleteUser);

// PATCH /users/:id/admin - Atualizar status de admin (requer admin)
router.patch('/:id/admin', adminMiddleware, userController.updateUserAdmin);

// PUT /users/:id/email - Adicionar ou atualizar email (qualquer usuário autenticado)
router.put('/:id/email', userController.updateUserEmail);

module.exports = router;

