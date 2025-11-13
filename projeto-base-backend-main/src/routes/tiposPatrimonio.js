const express = require('express');
const tipoPatrimonioController = require('../controller/tipoPatrimonio');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// Rotas com autenticação básica
router.get('/', authMiddleware, tipoPatrimonioController.getAllTiposPatrimonio);
router.get('/:id', authMiddleware, tipoPatrimonioController.getTipoPatrimonioById);

// Rotas restritas a admin
router.post('/', authMiddleware, adminMiddleware, tipoPatrimonioController.createTipoPatrimonio);
router.put('/:id', authMiddleware, adminMiddleware, tipoPatrimonioController.updateTipoPatrimonio);
router.delete('/:id', authMiddleware, adminMiddleware, tipoPatrimonioController.deleteTipoPatrimonio);

module.exports = router;
