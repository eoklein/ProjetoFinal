const express = require('express');
const patrimonioController = require('../controller/patrimonio');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// Aplicar autenticação a todas as rotas
router.use(authMiddleware);

// Rota GET genérica PRIMEIRA (antes das rotas com :id)
router.get('/', patrimonioController.getAllPatrimonios);

// Rotas específicas ANTES das rotas dinâmicas
// Rota para estoque compartilhado (todos os patrimônios)
router.get('/compartilhados/todos', patrimonioController.getAllPatrimoniosCompartilhados);

// Rota para admin - todos os patrimônios (sem filtro de usuário)
router.get('/admin/todos', patrimonioController.getTodosPatrimonios);

// Rotas com parâmetros dinâmicos (depois das rotas específicas)
router.get('/:id', patrimonioController.getPatrimonioById);
router.post('/', patrimonioController.createPatrimonio);
router.put('/:id', patrimonioController.updatePatrimonio);
router.delete('/:id', patrimonioController.deletePatrimonio);

module.exports = router;
