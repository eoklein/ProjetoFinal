const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const estoqueController = {
    async getAllEstoques(req, res) {
        try {
            const userId = req.user.id;

            const estoques = await prisma.estoque.findMany({
                where: {userId},
                select: {
                    id: true,
                    descricao: true,
                    valor: true,
                    data: true,
                    tipo: true,
                    userId: true,
                    tipoPatrimonioId: true,
                    patrimonioId: true,
                    numeroRetiradas: true,
                    retiradaAtual: true,
                    estoquePaiId: true,
                    efetivado: true,
                    tipoPatrimonio: {
                        select: {
                            id: true,
                            nome: true
                        }
                    },
                    patrimonio: {
                        select: {
                            id: true,
                            nome: true
                        }
                    }
                },
                orderBy: {
                    data: 'desc'
                }
            });

            res.json(estoques);
        } catch (error) {
            console.error('Erro ao buscar estoques:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async getAllEstoquesCompartilhados(req, res) {
        try {
            // Retorna TODOS os estoques sem filtro de usuário
            const estoques = await prisma.estoque.findMany({
                select: {
                    id: true,
                    descricao: true,
                    valor: true,
                    data: true,
                    tipo: true,
                    userId: true,
                    tipoPatrimonioId: true,
                    patrimonioId: true,
                    numeroRetiradas: true,
                    retiradaAtual: true,
                    estoquePaiId: true,
                    efetivado: true,
                    tipoPatrimonio: {
                        select: {
                            id: true,
                            nome: true
                        }
                    },
                    patrimonio: {
                        select: {
                            id: true,
                            nome: true
                        }
                    },
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

            res.json(estoques);
        } catch (error) {
            console.error('Erro ao buscar estoques compartilhados:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async getEstoqueById(req, res) {
        try {
            const estoqueId = parseInt(req.params.id);
            const userId = req.user.id;

            const estoque = await prisma.estoque.findFirst({
                where: {
                    id: estoqueId,
                    userId
                },
                select: {
                    id: true,
                    descricao: true,
                    valor: true,
                    data: true,
                    tipo: true,
                    userId: true,
                    tipoPatrimonioId: true,
                    patrimonioId: true,
                    numeroRetiradas: true,
                    retiradaAtual: true,
                    estoquePaiId: true,
                    efetivado: true,
                    tipoPatrimonio: {
                        select: {
                            id: true,
                            nome: true
                        }
                    },
                    patrimonio: {
                        select: {
                            id: true,
                            nome: true,
                            saldo: true
                        }
                    },
                    retirados: {
                        select: {
                            id: true,
                            descricao: true,
                            valor: true,
                            data: true,
                            retiradaAtual: true,
                            efetivado: true
                        },
                        orderBy: {
                            retiradaAtual: 'asc'
                        }
                    }
                }
            });

            if (!estoque) {
                return res.status(404).json({error: 'Estoque não encontrado'});
            }

            res.json(estoque);
        } catch (error) {
            console.error('Erro ao buscar estoque:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async createEstoque(req, res) {
        try {
            const {descricao, valor, data, tipo, tipoPatrimonioId, patrimonioId, numeroRetiradas, retiradaAtual, estoquePaiId, efetivado} = req.body;
            const userId = req.user.id;

            // Validações
            if (!descricao) {
                return res.status(400).json({error: 'Descrição é obrigatória'});
            }

            if (valor === undefined || valor === null) {
                return res.status(400).json({error: 'Valor é obrigatório'});
            }

            if (!data) {
                return res.status(400).json({error: 'Data é obrigatória'});
            }

            if (!tipo) {
                return res.status(400).json({error: 'Tipo é obrigatório'});
            }

            if (tipo !== 'RECEITA' && tipo !== 'DESPESA') {
                return res.status(400).json({error: 'Tipo deve ser RECEITA ou DESPESA'});
            }

            // Validar se tipoPatrimonio existe e pertence ao usuário
            if (tipoPatrimonioId) {
                const tipoPatrimonio = await prisma.tipoPatrimonio.findFirst({
                    where: {
                        id: parseInt(tipoPatrimonioId),
                        userId
                    }
                });

                if (!tipoPatrimonio) {
                    return res.status(404).json({error: 'Tipo de patrimonio não encontrado'});
                }
            }

            // Validar se patrimonio existe e pertence ao usuário
            if (patrimonioId) {
                const patrimonio = await prisma.patrimonio.findFirst({
                    where: {
                        id: parseInt(patrimonioId),
                        userId
                    }
                });

                if (!patrimonio) {
                    return res.status(404).json({error: 'patrimonio não encontrada'});
                }
            }

            // Validar estoquePaiId se fornecido e pertence ao usuário
            if (estoquePaiId) {
                const estoquePai = await prisma.estoque.findFirst({
                    where: {
                        id: parseInt(estoquePaiId),
                        userId
                    }
                });

                if (!estoquePai) {
                    return res.status(404).json({error: 'Estoque pai não encontrado'});
                }
            }

            // Validações de retirada
            if (numeroRetiradas && numeroRetiradas < 1) {
                return res.status(400).json({error: 'Número de retiradas deve ser maior que 0'});
            }

            if (retiradaAtual && numeroRetiradas && retiradaAtual > numeroRetiradas) {
                return res.status(400).json({error: 'Retirada atual não pode ser maior que o número total de retiradas'});
            }

            const estoque = await prisma.estoque.create({
                data: {
                    descricao,
                    valor: parseFloat(valor),
                    data: new Date(data),
                    tipo,
                    userId,
                    tipoPatrimonioId: tipoPatrimonioId ? parseInt(tipoPatrimonioId) : null,
                    patrimonioId: patrimonioId ? parseInt(patrimonioId) : null,
                    numeroRetiradas: numeroRetiradas ? parseInt(numeroRetiradas) : null,
                    retiradaAtual: retiradaAtual ? parseInt(retiradaAtual) : null,
                    estoquePaiId: estoquePaiId ? parseInt(estoquePaiId) : null,
                    efetivado: efetivado !== undefined ? efetivado : false
                },
                include: {
                    tipoPatrimonio: {
                        select: {
                            id: true,
                            nome: true
                        }
                    },
                    patrimonio: {
                        select: {
                            id: true,
                            nome: true
                        }
                    }
                }
            });

            res.status(201).json({
                message: 'Estoque criado com sucesso',
                estoque: {
                    id: estoque.id,
                    descricao: estoque.descricao,
                    valor: estoque.valor,
                    data: estoque.data,
                    tipo: estoque.tipo,
                    userId: estoque.userId,
                    tipoPatrimonioId: estoque.tipoPatrimonioId,
                    patrimonioId: estoque.patrimonioId,
                    numeroRetiradas: estoque.numeroRetiradas,
                    retiradaAtual: estoque.retiradaAtual,
                    estoquePaiId: estoque.estoquePaiId,
                    efetivado: estoque.efetivado,
                    tipoPatrimonio: estoque.tipoPatrimonio,
                    patrimonio: estoque.patrimonio
                }
            });
        } catch (error) {
            console.error('Erro ao criar estoque:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async updateEstoque(req, res) {
        try {
            console.log('Requisição de atualização recebida:', req.params.id, req.body);
            const estoqueId = parseInt(req.params.id);
            const {descricao, valor, data, tipo, tipoPatrimonioId, patrimonioId, numeroRetiradas, retiradaAtual, estoquePaiId, efetivado} = req.body;
            const userId = req.user.id;

            const existingEstoque = await prisma.estoque.findFirst({
                where: {
                    id: estoqueId,
                    userId
                }
            });

            if (!existingEstoque) {
                return res.status(404).json({error: 'Estoque não encontrado'});
            }

            // Validação do tipo se fornecido
            if (tipo && tipo !== 'RECEITA' && tipo !== 'DESPESA') {
                return res.status(400).json({error: 'Tipo deve ser RECEITA ou DESPESA'});
            }

            // Validar se tipoPatrimonio existe e pertence ao usuário
            if (tipoPatrimonioId !== undefined && tipoPatrimonioId !== null) {
                const tipoPatrimonio = await prisma.tipoPatrimonio.findFirst({
                    where: {
                        id: parseInt(tipoPatrimonioId),
                        userId
                    }
                });

                if (!tipoPatrimonio) {
                    return res.status(404).json({error: 'Tipo de patrimonio não encontrado'});
                }
            }

            // Validar se patrimonio existe e pertence ao usuário
            if (patrimonioId !== undefined && patrimonioId !== null) {
                const patrimonio = await prisma.patrimonio.findFirst({
                    where: {
                        id: parseInt(patrimonioId),
                        userId
                    }
                });

                if (!patrimonio) {
                    return res.status(404).json({error: 'patrimonio não encontrada'});
                }
            }

            // Validar estoquePaiId se fornecido e pertence ao usuário
            if (estoquePaiId !== undefined && estoquePaiId !== null) {
                const estoquePai = await prisma.estoque.findFirst({
                    where: {
                        id: parseInt(estoquePaiId),
                        userId
                    }
                });

                if (!estoquePai) {
                    return res.status(404).json({error: 'Estoque pai não encontrado'});
                }
            }

            // Validações de retirada
            if (numeroRetiradas !== undefined && numeroRetiradas !== null && numeroRetiradas < 1) {
                return res.status(400).json({error: 'Número de retiradas deve ser maior que 0'});
            }

            const updateData = {};
            if (descricao !== undefined) {
                updateData.descricao = descricao;
            }
            if (valor !== undefined) {
                updateData.valor = parseFloat(valor);
            }
            if (data !== undefined) {
                updateData.data = new Date(data);
            }
            if (tipo !== undefined) {
                updateData.tipo = tipo;
            }
            if (tipoPatrimonioId !== undefined) {
                updateData.tipoPatrimonioId = tipoPatrimonioId ? parseInt(tipoPatrimonioId) : null;
            }
            if (patrimonioId !== undefined) {
                updateData.patrimonioId = patrimonioId ? parseInt(patrimonioId) : null;
            }
            if (numeroRetiradas !== undefined) {
                updateData.numeroRetiradas = numeroRetiradas ? parseInt(numeroRetiradas) : null;
            }
            if (retiradaAtual !== undefined) {
                updateData.retiradaAtual = retiradaAtual ? parseInt(retiradaAtual) : null;
            }
            if (estoquePaiId !== undefined) {
                updateData.estoquePaiId = estoquePaiId ? parseInt(estoquePaiId) : null;
            }
            if (efetivado !== undefined) {
                updateData.efetivado = efetivado;
            }

            const estoque = await prisma.estoque.update({
                where: {id: estoqueId},
                data: updateData,
                include: {
                    tipoPatrimonio: {
                        select: {
                            id: true,
                            nome: true
                        }
                    },
                    patrimonio: {
                        select: {
                            id: true,
                            nome: true
                        }
                    }
                }
            });

            res.json({
                message: 'Estoque atualizado com sucesso',
                estoque: {
                    id: estoque.id,
                    descricao: estoque.descricao,
                    valor: estoque.valor,
                    data: estoque.data,
                    tipo: estoque.tipo,
                    userId: estoque.userId,
                    tipoPatrimonioId: estoque.tipoPatrimonioId,
                    patrimonioId: estoque.patrimonioId,
                    numeroRetiradas: estoque.numeroRetiradas,
                    retiradaAtual: estoque.retiradaAtual,
                    estoquePaiId: estoque.estoquePaiId,
                    efetivado: estoque.efetivado,
                    tipoPatrimonio: estoque.tipoPatrimonio,
                    patrimonio: estoque.patrimonio
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar estoque:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async deleteEstoque(req, res) {
        try {
            const estoqueId = parseInt(req.params.id);
            const userId = req.user.id;

            const existingEstoque = await prisma.estoque.findFirst({
                where: {
                    id: estoqueId,
                    userId
                }
            });

            if (!existingEstoque) {
                return res.status(404).json({error: 'Estoque não encontrado'});
            }

            await prisma.estoque.delete({
                where: {id: estoqueId}
            });

            // Verificar se ainda há estoques
            const countEstoques = await prisma.estoque.count();
            
            // Se não houver mais estoques, resetar o auto-increment
            if (countEstoques === 0) {
                try {
                    // SQLite: DELETE funciona melhor que UPDATE para sqlite_sequence
                    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence WHERE name = 'Estoque'`);
                    console.log('✅ Sequência de Estoque resetada com sucesso');
                } catch (error) {
                    console.error('❌ Erro ao resetar sequência de Estoque:', error.message);
                }
            }

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar estoque:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async createEstoqueComRetiradas(req, res) {
        try {
            const {descricao, valorTotal, dataInicial, tipo, tipoPatrimonioId, patrimonioId, numeroRetiradas} = req.body;
            const userId = req.user.id;

            // Validações
            if (!descricao) {
                return res.status(400).json({error: 'Descrição é obrigatória'});
            }

            if (valorTotal === undefined || valorTotal === null) {
                return res.status(400).json({error: 'Valor total é obrigatório'});
            }

            if (!dataInicial) {
                return res.status(400).json({error: 'Data inicial é obrigatória'});
            }

            if (!tipo) {
                return res.status(400).json({error: 'Tipo é obrigatório'});
            }

            if (tipo !== 'RECEITA' && tipo !== 'DESPESA') {
                return res.status(400).json({error: 'Tipo deve ser RECEITA ou DESPESA'});
            }

            if (!numeroRetiradas || numeroRetiradas < 2) {
                return res.status(400).json({error: 'Número de retiradas deve ser maior ou igual a 2'});
            }

            // Validar se tipoPatrimonio existe e pertence ao usuário
            if (tipoPatrimonioId) {
                const tipoPatrimonio = await prisma.tipoPatrimonio.findFirst({
                    where: {
                        id: parseInt(tipoPatrimonioId),
                        userId
                    }
                });

                if (!tipoPatrimonio) {
                    return res.status(404).json({error: 'Tipo de patrimonio não encontrado'});
                }
            }

            // Validar se patrimonio existe e pertence ao usuário
            if (patrimonioId) {
                const patrimonio = await prisma.patrimonio.findFirst({
                    where: {
                        id: parseInt(patrimonioId),
                        userId
                    }
                });

                if (!patrimonio) {
                    return res.status(404).json({error: 'patrimonio não encontrada'});
                }
            }

            const valorParcela = parseFloat(valorTotal) / parseInt(numeroRetiradas);
            const dataBase = new Date(dataInicial);
            const retirados = [];

            // Criar estoque pai
            const estoquePai = await prisma.estoque.create({
                data: {
                    descricao: `${descricao} (Com Retiradas)`,
                    valor: parseFloat(valorTotal),
                    data: dataBase,
                    tipo,
                    userId,
                    tipoPatrimonioId: tipoPatrimonioId ? parseInt(tipoPatrimonioId) : null,
                    patrimonioId: patrimonioId ? parseInt(patrimonioId) : null,
                    numeroRetiradas: parseInt(numeroRetiradas),
                    retiradaAtual: 0
                }
            });

            // Criar retiradas
            for (let i = 1; i <= parseInt(numeroRetiradas); i++) {
                const dataRetirada = new Date(dataBase);
                dataRetirada.setMonth(dataRetirada.getMonth() + i - 1);

                const retirada = await prisma.estoque.create({
                    data: {
                        descricao: `${descricao} (${i}/${numeroRetiradas})`,
                        valor: valorParcela,
                        data: dataRetirada,
                        tipo,
                        userId,
                        tipoPatrimonioId: tipoPatrimonioId ? parseInt(tipoPatrimonioId) : null,
                        patrimonioId: patrimonioId ? parseInt(patrimonioId) : null,
                        numeroRetiradas: parseInt(numeroRetiradas),
                        retiradaAtual: i,
                        estoquePaiId: estoquePai.id
                    },
                    include: {
                        tipoPatrimonio: {
                            select: {
                                id: true,
                                nome: true
                            }
                        },
                        patrimonio: {
                            select: {
                                id: true,
                                nome: true
                            }
                        }
                    }
                });

                retirados.push(retirada);
            }

            res.status(201).json({
                message: 'Estoque com retiradas criado com sucesso',
                estoquePai: {
                    id: estoquePai.id,
                    descricao: estoquePai.descricao,
                    valorTotal: estoquePai.valor,
                    numeroRetiradas: estoquePai.numeroRetiradas
                },
                retirados: retirados.map(r => ({
                    id: r.id,
                    descricao: r.descricao,
                    valor: r.valor,
                    data: r.data,
                    retiradaAtual: r.retiradaAtual,
                    tipoPatrimonio: r.tipoPatrimonio,
                    patrimonio: r.patrimonio
                }))
            });
        } catch (error) {
            console.error('Erro ao criar estoque com retiradas:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    }
};

module.exports = estoqueController;