const express = require('express');
const patrimonioController = require('../controller/patrimonio');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// Rotas com autenticação básica
router.get('/', authMiddleware, patrimonioController.getAllPatrimonios);
router.get('/:id', authMiddleware, patrimonioController.getPatrimonioById);
router.post('/', authMiddleware, patrimonioController.createPatrimonio);
router.put('/:id', authMiddleware, patrimonioController.updatePatrimonio);
router.delete('/:id', authMiddleware, patrimonioController.deletePatrimonio);

module.exports = router;
