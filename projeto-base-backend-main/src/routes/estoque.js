const express = require('express');
const router = express.Router();
const estoqueController = require('../controller/estoque');
const authMiddleware = require('../middlewares/auth');

// Listar todos os estoques (requer autenticação)
router.get('/', authMiddleware, estoqueController.getAllEstoques);

// Criar estoque com retiradas (requer autenticação) - DEVE vir antes de /:id
router.post('/com-retiradas', authMiddleware, estoqueController.createEstoqueComRetiradas);

// Buscar estoque por ID (requer autenticação)
router.get('/:id', authMiddleware, estoqueController.getEstoqueById);

// Criar novo estoque (requer autenticação)
router.post('/', authMiddleware, estoqueController.createEstoque);

// Atualizar estoque (requer autenticação)
router.put('/:id', authMiddleware, estoqueController.updateEstoque);

// Deletar estoque (requer autenticação)
router.delete('/:id', authMiddleware, estoqueController.deleteEstoque);

module.exports = router;

