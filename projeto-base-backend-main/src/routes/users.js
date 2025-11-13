const express = require('express');
const userController = require('../controller/user');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /users - Listar todos os usuários (requer admin)
router.get('/', adminMiddleware, userController.getUsers);

// GET /users/:id - Buscar usuário por ID (requer admin)
router.get('/:id', adminMiddleware, userController.getUserById);

// DELETE /users/:id - Deletar usuário (requer admin)
router.delete('/:id', adminMiddleware, userController.deleteUser);

// PATCH /users/:id/admin - Atualizar status de admin (requer admin)
router.patch('/:id/admin', adminMiddleware, userController.updateUserAdmin);

module.exports = router;

