const express = require('express');
const bookController = require('../controller/book');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

router.get('/', authMiddleware, bookController.getAllBooks);
router.get('/:id', authMiddleware, bookController.getBookById);
router.post('/:id/borrow', authMiddleware, bookController.borrowBook);
router.post('/:id/return', authMiddleware, bookController.returnBook);

router.post('/', authMiddleware, adminMiddleware, bookController.createBook);
router.patch('/:id', authMiddleware, adminMiddleware, bookController.updateBook);
router.delete('/:id', authMiddleware, adminMiddleware, bookController.deleteBook);

module.exports = router;