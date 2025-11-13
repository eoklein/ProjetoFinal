const express = require('express');
const contaController = require('../controller/conta');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// Rotas com autenticação básica
router.get('/', authMiddleware, contaController.getAllContas);
router.get('/:id', authMiddleware, contaController.getContaById);
router.post('/', authMiddleware, contaController.createConta);
router.put('/:id', authMiddleware, contaController.updateConta);
router.delete('/:id', authMiddleware, contaController.deleteConta);

module.exports = router;

