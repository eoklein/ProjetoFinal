const express = require('express');
const tipoPatrimonioController = require('../controller/tipoPatrimonio');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// Rotas com autenticação básica
router.get('/', authMiddleware, tipoPatrimonioController.getAllTiposPatrimonio);
router.get('/:id', authMiddleware, tipoPatrimonioController.getTipoPatrimonioById);
router.post('/', authMiddleware, tipoPatrimonioController.createTipoPatrimonio);
router.put('/:id', authMiddleware, tipoPatrimonioController.updateTipoPatrimonio);
router.delete('/:id', authMiddleware, tipoPatrimonioController.deleteTipoPatrimonio);

module.exports = router;
