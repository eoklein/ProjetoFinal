const express = require('express');
const authMiddleware = require('../middlewares/auth');
const reservaController = require('../controller/reserva');

const router = express.Router();

router.use(authMiddleware);

// GET todas as reservas do usuário
router.get('/', reservaController.getAllReservas);

// GET patrimônios disponíveis (não reservados)
router.get('/disponivel', reservaController.getPatrimoniosDisponiveis);

// POST criar nova reserva
router.post('/', reservaController.createReserva);

// PUT atualizar reserva
router.put('/:id', reservaController.updateReserva);

// DELETE deletar reserva
router.delete('/:id', reservaController.deleteReserva);

module.exports = router;
