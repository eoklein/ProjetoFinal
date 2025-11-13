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
                    codigo: true,
                    estado: true,
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
                    codigo: true,
                    estado: true,
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
                    estado: true,
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
                    codigo: true,
                    estado: true,
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
            const {nome, codigo, estado, valor, tipoPatrimonioId} = req.body;
            const userId = req.user.id;

            if (!nome) {
                return res.status(400).json({error: 'Nome é obrigatório'});
            }

            if (!estado) {
                return res.status(400).json({error: 'Estado é obrigatório'});
            }

            if (!tipoPatrimonioId) {
                return res.status(400).json({error: 'Tipo de patrimonio é obrigatório'});
            }

            const validEstados = ['critico', 'danificado', 'bom'];
            if (!validEstados.includes(estado)) {
                return res.status(400).json({error: 'Estado deve ser: critico, danificado ou bom'});
            }

            const patrimonio = await prisma.patrimonio.create({
                data: {
                    nome,
                    codigo: codigo || null,
                    estado,
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
                    codigo: patrimonio.codigo,
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
            console.log('Requisição de atualização recebida:', req.params.id, req.body);
            const patrimonioId = parseInt(req.params.id);
            const {nome, codigo, estado, valor, tipoPatrimonioId} = req.body;
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
            
            // Apenas atualizar campos que foram explicitamente enviados e são diferentes
            if (nome !== undefined && nome !== null && nome.trim() !== '') {
                updateData.nome = nome;
            }
            if (codigo !== undefined && codigo !== null) {
                updateData.codigo = codigo;
            }
            if (estado !== undefined && estado !== null && estado !== '') {
                const validEstados = ['critico', 'danificado', 'bom'];
                if (!validEstados.includes(estado)) {
                    return res.status(400).json({error: 'Estado deve ser: critico, danificado ou bom'});
                }
                updateData.estado = estado;
            }
            if (valor !== undefined && valor !== null) {
                updateData.valor = valor;
            }

            // Se nenhum dado foi alterado, retornar o patrimonio atual sem atualizar
            let patrimonio = existingPatrimonio;
            
            if (Object.keys(updateData).length > 0) {
                patrimonio = await prisma.patrimonio.update({
                    where: {id: patrimonioId},
                    data: updateData
                });

                // Se tipoPatrimonioId foi alterado, atualizar o estoque associado
                if (tipoPatrimonioId !== undefined && tipoPatrimonioId !== null) {
                    await prisma.estoque.updateMany({
                        where: {patrimonioId: patrimonioId},
                        data: {tipoPatrimonioId: tipoPatrimonioId}
                    });
                }
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
                    codigo: patrimonio.codigo,
                    estado: patrimonio.estado,
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

            // Verificar se ainda há patrimonios
            const countPatrimonios = await prisma.patrimonio.count();
            
            // Se não houver mais patrimonios, resetar o auto-increment
            if (countPatrimonios === 0) {
                try {
                    // SQLite: Usar DELETE porque apenas DELETE funciona com sqlite_sequence
                    // UPDATE não funciona em triggers SQLite, mas funciona aqui em código
                    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name = 'Patrimonio'`);
                    console.log('✅ Sequência de Patrimonio resetada com sucesso');
                } catch (error) {
                    console.error('❌ Erro ao resetar sequência de Patrimonio:', error.message);
                }
            }

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar patrimonio:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    }
};

module.exports = patrimonioController;
