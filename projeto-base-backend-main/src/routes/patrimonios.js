const express = require('express');
const patrimonioController = require('../controller/patrimonio');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// Rotas específicas ANTES das rotas dinâmicas
// Rota para estoque compartilhado (todos os patrimônios)
router.get('/compartilhados/todos', authMiddleware, patrimonioController.getAllPatrimoniosCompartilhados);

// Rota para admin - todos os patrimônios (sem filtro de usuário)
router.get('/admin/todos', authMiddleware, patrimonioController.getTodosPatrimonios);

// Rotas com autenticação básica (incluindo dinâmicas)
router.get('/', authMiddleware, patrimonioController.getAllPatrimonios);
router.get('/:id', authMiddleware, patrimonioController.getPatrimonioById);
router.post('/', authMiddleware, patrimonioController.createPatrimonio);
router.put('/:id', authMiddleware, patrimonioController.updatePatrimonio);
router.delete('/:id', authMiddleware, adminMiddleware, patrimonioController.deletePatrimonio);

module.exports = router;
