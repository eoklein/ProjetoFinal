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
                    nome: true,
                    status: true,
                    data: true,
                    userId: true,
                    valor: true
                }
            });

            // Enriquecer com tipoPatrimonioId do estoque
            const patrimoniosComTipo = await Promise.all(
                patrimonios.map(async (p) => {
                    const estoque = await prisma.estoque.findFirst({
                        where: {patrimonioId: p.id},
                        select: {tipoPatrimonioId: true}
                    });
                    return {
                        ...p,
                        tipoPatrimonioId: estoque?.tipoPatrimonioId || null
                    };
                })
            );

            res.json(patrimoniosComTipo);
        } catch (error) {
            console.error('Erro ao buscar patrimonios:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async getAllPatrimoniosCompartilhados(req, res) {
        try {
            // Retorna todos os patrimônios sem filtro de userId
            const patrimonios = await prisma.patrimonio.findMany({
                select: {
                    id: true,
                    nome: true,
                    status: true,
                    data: true,
                    userId: true,
                    valor: true,
                    user: {
                        select: {
                            username: true
                        }
                    }
                },
                orderBy: {
                    data: 'desc'
                }
            });

            // Enriquecer com tipoPatrimonioId do estoque
            const patrimoniosComTipo = await Promise.all(
                patrimonios.map(async (p) => {
                    const estoque = await prisma.estoque.findFirst({
                        where: {patrimonioId: p.id},
                        select: {tipoPatrimonioId: true}
                    });
                    return {
                        ...p,
                        tipoPatrimonioId: estoque?.tipoPatrimonioId || null
                    };
                })
            );

            res.json(patrimoniosComTipo);
        } catch (error) {
            console.error('Erro ao buscar patrimônios compartilhados:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async getTodosPatrimonios(req, res) {
        try {
            // Retorna TODOS os patrimônios sem filtro (para a aba de Estoque)
            const patrimonios = await prisma.patrimonio.findMany({
                select: {
                    id: true,
                    nome: true,
                    status: true,
                    data: true,
                    userId: true,
                    valor: true,
                    user: {
                        select: {
                            username: true
                        }
                    }
                },
                orderBy: {
                    data: 'desc'
                }
            });

            // Enriquecer com tipoPatrimonioId do estoque
            const patrimoniosComTipo = await Promise.all(
                patrimonios.map(async (p) => {
                    const estoque = await prisma.estoque.findFirst({
                        where: {patrimonioId: p.id},
                        select: {tipoPatrimonioId: true}
                    });
                    return {
                        ...p,
                        tipoPatrimonioId: estoque?.tipoPatrimonioId || null
                    };
                })
            );

            res.json(patrimoniosComTipo);
        } catch (error) {
            console.error('Erro ao buscar todos os patrimônios:', error);
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
                    nome: true,
                    status: true,
                    data: true,
                    userId: true,
                    valor: true
                }
            });

            if (!patrimonio) {
                return res.status(404).json({error: 'Patrimonio não encontrado'});
            }

            // Buscar tipoPatrimonioId do estoque
            const estoque = await prisma.estoque.findFirst({
                where: {patrimonioId: patrimonio.id},
                select: {tipoPatrimonioId: true}
            });

            const patrimonioComTipo = {
                ...patrimonio,
                tipoPatrimonioId: estoque?.tipoPatrimonioId || null
            };

            res.json(patrimonioComTipo);
        } catch (error) {
            console.error('Erro ao buscar patrimonio:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async createPatrimonio(req, res) {
        try {
            const {nome, status, valor, tipoPatrimonioId} = req.body;
            const userId = req.user.id;

            if (!nome) {
                return res.status(400).json({error: 'Nome é obrigatório'});
            }

            if (!status) {
                return res.status(400).json({error: 'Status é obrigatório'});
            }

            if (!tipoPatrimonioId) {
                return res.status(400).json({error: 'Tipo de patrimonio é obrigatório'});
            }

            const validStatuses = ['critico', 'normal', 'bom'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({error: 'Status deve ser: critico, normal ou bom'});
            }

            const patrimonio = await prisma.patrimonio.create({
                data: {
                    nome,
                    status,
                    valor: valor || null,
                    userId
                }
            });

            // Criar estoque associado ao patrimonio com o tipo
            const estoque = await prisma.estoque.create({
                data: {
                    descricao: `Estoque inicial de ${nome}`,
                    valor: valor || 0,
                    data: new Date(),
                    tipo: 'RECEITA',
                    userId,
                    patrimonioId: patrimonio.id,
                    tipoPatrimonioId: tipoPatrimonioId
                }
            });

            res.status(201).json({
                message: 'Patrimonio criado com sucesso',
                patrimonio: {
                    id: patrimonio.id,
                    nome: patrimonio.nome,
                    status: patrimonio.status,
                    valor: patrimonio.valor,
                    data: patrimonio.data,
                    userId: patrimonio.userId,
                    tipoPatrimonioId: tipoPatrimonioId
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
            const {nome, status, valor, tipoPatrimonioId} = req.body;
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
            if (nome !== undefined) {
                updateData.nome = nome;
            }
            if (status !== undefined) {
                const validStatuses = ['critico', 'normal', 'bom'];
                if (!validStatuses.includes(status)) {
                    return res.status(400).json({error: 'Status deve ser: critico, normal ou bom'});
                }
                updateData.status = status;
            }
            if (valor !== undefined) {
                updateData.valor = valor;
            }

            const patrimonio = await prisma.patrimonio.update({
                where: {id: patrimonioId},
                data: updateData
            });

            // Se tipoPatrimonioId foi alterado, atualizar o estoque associado
            if (tipoPatrimonioId !== undefined) {
                await prisma.estoque.updateMany({
                    where: {patrimonioId: patrimonioId},
                    data: {tipoPatrimonioId: tipoPatrimonioId}
                });
            }

            // Buscar o tipo atualizado
            const estoqueComTipo = await prisma.estoque.findFirst({
                where: {patrimonioId: patrimonioId},
                select: {tipoPatrimonioId: true}
            });

            res.json({
                message: 'Patrimonio atualizado com sucesso',
                patrimonio: {
                    id: patrimonio.id,
                    nome: patrimonio.nome,
                    status: patrimonio.status,
                    valor: patrimonio.valor,
                    data: patrimonio.data,
                    userId: patrimonio.userId,
                    tipoPatrimonioId: estoqueComTipo?.tipoPatrimonioId
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

            const existingPatrimonio = await prisma.patrimonio.findUnique({
                where: {
                    id: patrimonioId
                }
            });

            if (!existingPatrimonio) {
                return res.status(404).json({error: 'Patrimonio não encontrado'});
            }

            // Deletar todos os estoques associados primeiro
            await prisma.estoque.deleteMany({
                where: {patrimonioId: patrimonioId}
            });

            // Depois deletar o patrimonio
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
