const express = require('express');
const categoryController = require('../controller/category');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Rotas públicas ou com autenticação básica
router.get('/', authMiddleware, categoryController.getAllCategories);
router.get('/:id', authMiddleware, categoryController.getCategoryById);
router.post('/', authMiddleware, categoryController.createCategory);
router.put('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;

