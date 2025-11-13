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
                    status: true,
                    data: true,
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
                    status: true,
                    data: true,
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
            const {descricao, status} = req.body;
            const userId = req.user.id;

            if (!descricao) {
                return res.status(400).json({error: 'Descrição é obrigatória'});
            }

            if (!status) {
                return res.status(400).json({error: 'Status é obrigatório'});
            }

            const validStatuses = ['critico', 'normal', 'bom'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({error: 'Status deve ser: critico, normal ou bom'});
            }

            const patrimonio = await prisma.patrimonio.create({
                data: {
                    descricao,
                    status,
                    userId
                }
            });

            res.status(201).json({
                message: 'Patrimonio criado com sucesso',
                patrimonio: {
                    id: patrimonio.id,
                    descricao: patrimonio.descricao,
                    status: patrimonio.status,
                    data: patrimonio.data,
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
            const {descricao, status} = req.body;
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
            if (status !== undefined) {
                const validStatuses = ['critico', 'normal', 'bom'];
                if (!validStatuses.includes(status)) {
                    return res.status(400).json({error: 'Status deve ser: critico, normal ou bom'});
                }
                updateData.status = status;
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
                    status: patrimonio.status,
                    data: patrimonio.data,
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
