const express = require('express');
const solicitacaoLancamentoController = require('../controller/solicitacaoLancamento');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// Rotas para usuários comuns (ver suas solicitações)
router.get('/minhas-solicitacoes', authMiddleware, solicitacaoLancamentoController.getSolicitacoesComum);
router.post('/', authMiddleware, solicitacaoLancamentoController.createSolicitacao);

// Rotas para admins (ver solicitações pendentes e aprovar/rejeitar)
router.get('/pendentes', authMiddleware, adminMiddleware, solicitacaoLancamentoController.getSolicitacoesPendentesAdmin);
router.put('/:id/aprovar', authMiddleware, adminMiddleware, solicitacaoLancamentoController.aprovarSolicitacao);
router.put('/:id/rejeitar', authMiddleware, adminMiddleware, solicitacaoLancamentoController.rejeitarSolicitacao);

module.exports = router;
