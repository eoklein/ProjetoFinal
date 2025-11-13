const express = require('express');
const authMiddleware = require('../middlewares/auth');
const reservaController = require('../controller/reserva');

const router = express.Router();

router.use(authMiddleware);

// Rotas específicas ANTES das rotas dinâmicas
// GET patrimônios disponíveis (não reservados)
router.get('/disponivel', reservaController.getPatrimoniosDisponiveis);

// Rotas com parâmetros dinâmicos
router.put('/:id', reservaController.updateReserva);
router.delete('/:id', reservaController.deleteReserva);
router.get('/:id', reservaController.getPatrimoniosDisponiveis); // Fallback se alguém tentar /reservas/:id

// Rotas genéricas por último
router.get('/', reservaController.getAllReservas);
router.post('/', reservaController.createReserva);

module.exports = router;
