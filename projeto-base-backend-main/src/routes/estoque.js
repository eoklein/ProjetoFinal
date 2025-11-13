const express = require('express');
const router = express.Router();
const estoqueController = require('../controller/estoque');
const authMiddleware = require('../middlewares/auth');

// Aplicar autenticação a todas as rotas
router.use(authMiddleware);

// Rotas específicas ANTES das rotas dinâmicas
// Rota para estoques compartilhados
router.get('/compartilhados/todos', estoqueController.getAllEstoquesCompartilhados);

// Criar estoque com retiradas - DEVE vir antes de /:id
router.post('/com-retiradas', estoqueController.createEstoqueComRetiradas);

// Rotas com parâmetros dinâmicos (depois das rotas específicas)
router.get('/:id', estoqueController.getEstoqueById);
router.put('/:id', estoqueController.updateEstoque);
router.delete('/:id', estoqueController.deleteEstoque);

// Rotas genéricas por último
router.get('/', estoqueController.getAllEstoques);
router.post('/', estoqueController.createEstoque);

module.exports = router;

