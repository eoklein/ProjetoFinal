const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const contaController = {
    async getAllContas(req, res) {
        try {
            const userId = req.user.id;

            const contas = await prisma.conta.findMany({
                where: {userId},
                select: {
                    id: true,
                    descricao: true,
                    saldo: true,
                    limite: true,
                    userId: true
                }
            });

            res.json(contas);
        } catch (error) {
            console.error('Erro ao buscar contas:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async getContaById(req, res) {
        try {
            const contaId = parseInt(req.params.id);
            const userId = req.user.id;

            const conta = await prisma.conta.findFirst({
                where: {
                    id: contaId,
                    userId
                },
                select: {
                    id: true,
                    descricao: true,
                    saldo: true,
                    limite: true,
                    userId: true
                }
            });

            if (!conta) {
                return res.status(404).json({error: 'Conta não encontrada'});
            }

            res.json(conta);
        } catch (error) {
            console.error('Erro ao buscar conta:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async createConta(req, res) {
        try {
            const {descricao, saldo, limite} = req.body;
            const userId = req.user.id;

            if (!descricao) {
                return res.status(400).json({error: 'Descrição é obrigatória'});
            }

            if (saldo === undefined || saldo === null) {
                return res.status(400).json({error: 'Saldo é obrigatório'});
            }

            if (limite === undefined || limite === null) {
                return res.status(400).json({error: 'Limite é obrigatório'});
            }

            const conta = await prisma.conta.create({
                data: {
                    descricao,
                    saldo: parseFloat(saldo),
                    limite: parseFloat(limite),
                    userId
                }
            });

            res.status(201).json({
                message: 'Conta criada com sucesso',
                conta: {
                    id: conta.id,
                    descricao: conta.descricao,
                    saldo: conta.saldo,
                    limite: conta.limite,
                    userId: conta.userId
                }
            });
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async updateConta(req, res) {
        try {
            console.log('Requisição de atualização de conta recebida:', req.params.id, req.body);
            const contaId = parseInt(req.params.id);
            const {descricao, saldo, limite} = req.body;
            const userId = req.user.id;

            const existingConta = await prisma.conta.findFirst({
                where: {
                    id: contaId,
                    userId
                }
            });

            if (!existingConta) {
                return res.status(404).json({error: 'Conta não encontrada'});
            }

            const updateData = {};
            if (descricao !== undefined) {
                updateData.descricao = descricao;
            }
            if (saldo !== undefined) {
                updateData.saldo = parseFloat(saldo);
            }
            if (limite !== undefined) {
                updateData.limite = parseFloat(limite);
            }

            const conta = await prisma.conta.update({
                where: {id: contaId},
                data: updateData
            });

            res.json({
                message: 'Conta atualizada com sucesso',
                conta: {
                    id: conta.id,
                    descricao: conta.descricao,
                    saldo: conta.saldo,
                    limite: conta.limite,
                    userId: conta.userId
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar conta:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async deleteConta(req, res) {
        try {
            const contaId = parseInt(req.params.id);
            const userId = req.user.id;

            const existingConta = await prisma.conta.findFirst({
                where: {
                    id: contaId,
                    userId
                }
            });

            if (!existingConta) {
                return res.status(404).json({error: 'Conta não encontrada'});
            }

            await prisma.conta.delete({
                where: {id: contaId}
            });

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar conta:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    }
};

module.exports = contaController;

