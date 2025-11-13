const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const solicitacaoLancamentoController = {
    async getSolicitacoesComum(req, res) {
        try {
            const userId = req.user.id;

            const solicitacoes = await prisma.solicitacaoLancamento.findMany({
                where: {usuarioId: userId},
                include: {
                    admin: {
                        select: {username: true}
                    },
                    tipoPatrimonio: true,
                    patrimonio: true
                },
                orderBy: {data_criacao: 'desc'}
            });

            res.json(solicitacoes);
        } catch (error) {
            console.error('Erro ao listar solicitações:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async getSolicitacoesPendentesAdmin(req, res) {
        try {
            const adminId = req.user.id;

            const solicitacoes = await prisma.solicitacaoLancamento.findMany({
                where: {
                    adminId: adminId,
                    status: 'PENDENTE'
                },
                include: {
                    usuario: {
                        select: {username: true}
                    },
                    tipoPatrimonio: true,
                    patrimonio: true
                },
                orderBy: {data_criacao: 'asc'}
            });

            res.json(solicitacoes);
        } catch (error) {
            console.error('Erro ao listar solicitações pendentes:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async createSolicitacao(req, res) {
        try {
            const {descricao, valor, data, tipo, tipoPatrimonioId, patrimonioId, adminId} = req.body;
            const usuarioId = req.user.id;

            if (!descricao) {
                return res.status(400).json({error: 'Descrição é obrigatória'});
            }

            if (valor === undefined || valor === null) {
                return res.status(400).json({error: 'Valor é obrigatório'});
            }

            if (!data) {
                return res.status(400).json({error: 'Data é obrigatória'});
            }

            if (!tipo || !['RECEITA', 'DESPESA'].includes(tipo)) {
                return res.status(400).json({error: 'Tipo deve ser RECEITA ou DESPESA'});
            }

            if (!adminId) {
                return res.status(400).json({error: 'Deve selecionar um admin para aprovar'});
            }

            const solicitacao = await prisma.solicitacaoLancamento.create({
                data: {
                    descricao,
                    valor: parseFloat(valor),
                    data: new Date(data),
                    tipo,
                    usuarioId,
                    adminId,
                    tipoPatrimonioId: tipoPatrimonioId ? parseInt(tipoPatrimonioId) : null,
                    patrimonioId: patrimonioId ? parseInt(patrimonioId) : null,
                    status: 'PENDENTE'
                },
                include: {
                    admin: {select: {username: true}},
                    tipoPatrimonio: true,
                    patrimonio: true
                }
            });

            res.status(201).json({
                message: 'Solicitação criada com sucesso',
                solicitacao
            });
        } catch (error) {
            console.error('Erro ao criar solicitação:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async aprovarSolicitacao(req, res) {
        try {
            const {id} = req.params;
            const adminId = req.user.id;
            const solicitacaoId = parseInt(id);

            const solicitacao = await prisma.solicitacaoLancamento.findUnique({
                where: {id: solicitacaoId}
            });

            if (!solicitacao) {
                return res.status(404).json({error: 'Solicitação não encontrada'});
            }

            if (solicitacao.adminId !== adminId) {
                return res.status(403).json({error: 'Você não tem permissão para aprovar esta solicitação'});
            }

            if (solicitacao.status !== 'PENDENTE') {
                return res.status(400).json({error: 'Esta solicitação já foi processada'});
            }

            // Criar o lançamento com base na solicitação
            const lancamento = await prisma.lancamento.create({
                data: {
                    descricao: solicitacao.descricao,
                    valor: solicitacao.valor,
                    data: solicitacao.data,
                    tipo: solicitacao.tipo,
                    userId: solicitacao.usuarioId,
                    tipoPatrimonioId: solicitacao.tipoPatrimonioId,
                    patrimonioId: solicitacao.patrimonioId,
                    efetivado: false
                }
            });

            // Atualizar solicitação como APROVADA
            const solicitacaoAtualizada = await prisma.solicitacaoLancamento.update({
                where: {id: solicitacaoId},
                data: {status: 'APROVADA'},
                include: {
                    usuario: {select: {username: true}},
                    admin: {select: {username: true}},
                    tipoPatrimonio: true,
                    patrimonio: true
                }
            });

            res.json({
                message: 'Solicitação aprovada com sucesso',
                solicitacao: solicitacaoAtualizada,
                lancamento
            });
        } catch (error) {
            console.error('Erro ao aprovar solicitação:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async rejeitarSolicitacao(req, res) {
        try {
            const {id} = req.params;
            const {motivo_rejeicao} = req.body;
            const adminId = req.user.id;
            const solicitacaoId = parseInt(id);

            const solicitacao = await prisma.solicitacaoLancamento.findUnique({
                where: {id: solicitacaoId}
            });

            if (!solicitacao) {
                return res.status(404).json({error: 'Solicitação não encontrada'});
            }

            if (solicitacao.adminId !== adminId) {
                return res.status(403).json({error: 'Você não tem permissão para rejeitar esta solicitação'});
            }

            if (solicitacao.status !== 'PENDENTE') {
                return res.status(400).json({error: 'Esta solicitação já foi processada'});
            }

            const solicitacaoAtualizada = await prisma.solicitacaoLancamento.update({
                where: {id: solicitacaoId},
                data: {
                    status: 'REJEITADA',
                    motivo_rejeicao: motivo_rejeicao || null
                },
                include: {
                    usuario: {select: {username: true}},
                    admin: {select: {username: true}},
                    tipoPatrimonio: true,
                    patrimonio: true
                }
            });

            res.json({
                message: 'Solicitação rejeitada com sucesso',
                solicitacao: solicitacaoAtualizada
            });
        } catch (error) {
            console.error('Erro ao rejeitar solicitação:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    }
};

module.exports = solicitacaoLancamentoController;
