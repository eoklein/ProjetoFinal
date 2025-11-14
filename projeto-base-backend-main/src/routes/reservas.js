const express = require('express');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');
const reservaController = require('../controller/reserva');
const statusSync = require('../utils/statusSync');

const router = express.Router();

router.use(authMiddleware);

// Rotas específicas ANTES das rotas dinâmicas
// GET patrimônios disponíveis (não reservados)
router.get('/disponivel', reservaController.getPatrimoniosDisponiveis);

// Rota admin para verificar consistência de status
router.get('/admin/verificar-consistencia/:patrimonioId', adminMiddleware, async (req, res) => {
    try {
        const patrimonioId = parseInt(req.params.patrimonioId);
        const resultado = await statusSync.getPatrimonioStatusCompleto(patrimonioId);
        res.json({
            sucesso: true,
            dados: resultado
        });
    } catch (error) {
        res.status(400).json({
            sucesso: false,
            erro: error.message
        });
    }
});

// Rota admin para reparar inconsistências
router.post('/admin/reparar-consistencia/:patrimonioId', adminMiddleware, async (req, res) => {
    try {
        const patrimonioId = parseInt(req.params.patrimonioId);
        await statusSync.repararConsistencia(patrimonioId);
        res.json({
            sucesso: true,
            mensagem: `Consistência reparada para patrimonio ${patrimonioId}`
        });
    } catch (error) {
        res.status(400).json({
            sucesso: false,
            erro: error.message
        });
    }
});

// Rotas com parâmetros dinâmicos
router.put('/:id', reservaController.updateReserva);
router.delete('/:id', reservaController.deleteReserva);
router.get('/:id', reservaController.getPatrimoniosDisponiveis); // Fallback se alguém tentar /reservas/:id

// Rotas genéricas por último
router.get('/', reservaController.getAllReservas);
router.post('/', reservaController.createReserva);

module.exports = router;
