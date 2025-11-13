const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const patrimonioController = {
    async getAllPatrimonios(req, res) {
        try {
            const userId = req.user.id;

            const patrimonios = await prisma.patrimonio.findMany({
                where: {userId},
                select: {
                    id: true,
                    descricao: true,
                    saldo: true,
                    limite: true,
                    userId: true
                }
            });

            res.json(patrimonios);
        } catch (error) {
            console.error('Erro ao buscar patrimonios:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async getPatrimonioById(req, res) {
        try {
            const patrimonioId = parseInt(req.params.id);
            const userId = req.user.id;

            const patrimonio = await prisma.patrimonio.findFirst({
                where: {
                    id: patrimonioId,
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

            if (!patrimonio) {
                return res.status(404).json({error: 'Patrimonio não encontrado'});
            }

            res.json(patrimonio);
        } catch (error) {
            console.error('Erro ao buscar patrimonio:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async createPatrimonio(req, res) {
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

            const patrimonio = await prisma.patrimonio.create({
                data: {
                    descricao,
                    saldo: parseFloat(saldo),
                    limite: parseFloat(limite),
                    userId
                }
            });

            res.status(201).json({
                message: 'Patrimonio criado com sucesso',
                patrimonio: {
                    id: patrimonio.id,
                    descricao: patrimonio.descricao,
                    saldo: patrimonio.saldo,
                    limite: patrimonio.limite,
                    userId: patrimonio.userId
                }
            });
        } catch (error) {
            console.error('Erro ao criar patrimonio:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async updatePatrimonio(req, res) {
        try {
            console.log('Requisição de atualização de patrimonio recebida:', req.params.id, req.body);
            const patrimonioId = parseInt(req.params.id);
            const {descricao, saldo, limite} = req.body;
            const userId = req.user.id;

            const existingPatrimonio = await prisma.patrimonio.findFirst({
                where: {
                    id: patrimonioId,
                    userId
                }
            });

            if (!existingPatrimonio) {
                return res.status(404).json({error: 'Patrimonio não encontrado'});
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

            const patrimonio = await prisma.patrimonio.update({
                where: {id: patrimonioId},
                data: updateData
            });

            res.json({
                message: 'Patrimonio atualizado com sucesso',
                patrimonio: {
                    id: patrimonio.id,
                    descricao: patrimonio.descricao,
                    saldo: patrimonio.saldo,
                    limite: patrimonio.limite,
                    userId: patrimonio.userId
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar patrimonio:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async deletePatrimonio(req, res) {
        try {
            const patrimonioId = parseInt(req.params.id);
            const userId = req.user.id;

            const existingPatrimonio = await prisma.patrimonio.findFirst({
                where: {
                    id: patrimonioId,
                    userId
                }
            });

            if (!existingPatrimonio) {
                return res.status(404).json({error: 'Patrimonio não encontrado'});
            }

            await prisma.patrimonio.delete({
                where: {id: patrimonioId}
            });

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar patrimonio:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    }
};

module.exports = patrimonioController;
