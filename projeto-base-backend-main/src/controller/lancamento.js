const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const lancamentoController = {
    async getAllLancamentos(req, res) {
        try {
            const userId = req.user.id;

            const lancamentos = await prisma.lancamento.findMany({
                where: {userId},
                select: {
                    id: true,
                    descricao: true,
                    valor: true,
                    data: true,
                    tipo: true,
                    userId: true,
                    categoriaId: true,
                    contaId: true,
                    numeroParcelas: true,
                    parcelaAtual: true,
                    lancamentoPaiId: true,
                    efetivado: true,
                    categoria: {
                        select: {
                            id: true,
                            nome: true
                        }
                    },
                    conta: {
                        select: {
                            id: true,
                            descricao: true
                        }
                    }
                },
                orderBy: {
                    data: 'desc'
                }
            });

            res.json(lancamentos);
        } catch (error) {
            console.error('Erro ao buscar lançamentos:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async getLancamentoById(req, res) {
        try {
            const lancamentoId = parseInt(req.params.id);
            const userId = req.user.id;

            const lancamento = await prisma.lancamento.findFirst({
                where: {
                    id: lancamentoId,
                    userId
                },
                select: {
                    id: true,
                    descricao: true,
                    valor: true,
                    data: true,
                    tipo: true,
                    userId: true,
                    categoriaId: true,
                    contaId: true,
                    numeroParcelas: true,
                    parcelaAtual: true,
                    lancamentoPaiId: true,
                    efetivado: true,
                    categoria: {
                        select: {
                            id: true,
                            nome: true
                        }
                    },
                    conta: {
                        select: {
                            id: true,
                            descricao: true,
                            saldo: true
                        }
                    },
                    parcelas: {
                        select: {
                            id: true,
                            descricao: true,
                            valor: true,
                            data: true,
                            parcelaAtual: true,
                            efetivado: true
                        },
                        orderBy: {
                            parcelaAtual: 'asc'
                        }
                    }
                }
            });

            if (!lancamento) {
                return res.status(404).json({error: 'Lançamento não encontrado'});
            }

            res.json(lancamento);
        } catch (error) {
            console.error('Erro ao buscar lançamento:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async createLancamento(req, res) {
        try {
            const {descricao, valor, data, tipo, categoriaId, contaId, numeroParcelas, parcelaAtual, lancamentoPaiId, efetivado} = req.body;
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

            // Validar se categoria existe e pertence ao usuário
            if (categoriaId) {
                const categoria = await prisma.category.findFirst({
                    where: {
                        id: parseInt(categoriaId),
                        userId
                    }
                });

                if (!categoria) {
                    return res.status(404).json({error: 'Categoria não encontrada'});
                }
            }

            // Validar se conta existe e pertence ao usuário
            if (contaId) {
                const conta = await prisma.conta.findFirst({
                    where: {
                        id: parseInt(contaId),
                        userId
                    }
                });

                if (!conta) {
                    return res.status(404).json({error: 'Conta não encontrada'});
                }
            }

            // Validar lancamentoPaiId se fornecido e pertence ao usuário
            if (lancamentoPaiId) {
                const lancamentoPai = await prisma.lancamento.findFirst({
                    where: {
                        id: parseInt(lancamentoPaiId),
                        userId
                    }
                });

                if (!lancamentoPai) {
                    return res.status(404).json({error: 'Lançamento pai não encontrado'});
                }
            }

            // Validações de parcelamento
            if (numeroParcelas && numeroParcelas < 1) {
                return res.status(400).json({error: 'Número de parcelas deve ser maior que 0'});
            }

            if (parcelaAtual && numeroParcelas && parcelaAtual > numeroParcelas) {
                return res.status(400).json({error: 'Parcela atual não pode ser maior que o número total de parcelas'});
            }

            const lancamento = await prisma.lancamento.create({
                data: {
                    descricao,
                    valor: parseFloat(valor),
                    data: new Date(data),
                    tipo,
                    userId,
                    categoriaId: categoriaId ? parseInt(categoriaId) : null,
                    contaId: contaId ? parseInt(contaId) : null,
                    numeroParcelas: numeroParcelas ? parseInt(numeroParcelas) : null,
                    parcelaAtual: parcelaAtual ? parseInt(parcelaAtual) : null,
                    lancamentoPaiId: lancamentoPaiId ? parseInt(lancamentoPaiId) : null,
                    efetivado: efetivado !== undefined ? efetivado : false
                },
                include: {
                    categoria: {
                        select: {
                            id: true,
                            nome: true
                        }
                    },
                    conta: {
                        select: {
                            id: true,
                            descricao: true
                        }
                    }
                }
            });

            res.status(201).json({
                message: 'Lançamento criado com sucesso',
                lancamento: {
                    id: lancamento.id,
                    descricao: lancamento.descricao,
                    valor: lancamento.valor,
                    data: lancamento.data,
                    tipo: lancamento.tipo,
                    userId: lancamento.userId,
                    categoriaId: lancamento.categoriaId,
                    contaId: lancamento.contaId,
                    numeroParcelas: lancamento.numeroParcelas,
                    parcelaAtual: lancamento.parcelaAtual,
                    lancamentoPaiId: lancamento.lancamentoPaiId,
                    efetivado: lancamento.efetivado,
                    categoria: lancamento.categoria,
                    conta: lancamento.conta
                }
            });
        } catch (error) {
            console.error('Erro ao criar lançamento:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async updateLancamento(req, res) {
        try {
            console.log('Requisição de atualização recebida:', req.params.id, req.body);
            const lancamentoId = parseInt(req.params.id);
            const {descricao, valor, data, tipo, categoriaId, contaId, numeroParcelas, parcelaAtual, lancamentoPaiId, efetivado} = req.body;
            const userId = req.user.id;

            const existingLancamento = await prisma.lancamento.findFirst({
                where: {
                    id: lancamentoId,
                    userId
                }
            });

            if (!existingLancamento) {
                return res.status(404).json({error: 'Lançamento não encontrado'});
            }

            // Validação do tipo se fornecido
            if (tipo && tipo !== 'RECEITA' && tipo !== 'DESPESA') {
                return res.status(400).json({error: 'Tipo deve ser RECEITA ou DESPESA'});
            }

            // Validar se categoria existe e pertence ao usuário
            if (categoriaId !== undefined && categoriaId !== null) {
                const categoria = await prisma.category.findFirst({
                    where: {
                        id: parseInt(categoriaId),
                        userId
                    }
                });

                if (!categoria) {
                    return res.status(404).json({error: 'Categoria não encontrada'});
                }
            }

            // Validar se conta existe e pertence ao usuário
            if (contaId !== undefined && contaId !== null) {
                const conta = await prisma.conta.findFirst({
                    where: {
                        id: parseInt(contaId),
                        userId
                    }
                });

                if (!conta) {
                    return res.status(404).json({error: 'Conta não encontrada'});
                }
            }

            // Validar lancamentoPaiId se fornecido e pertence ao usuário
            if (lancamentoPaiId !== undefined && lancamentoPaiId !== null) {
                const lancamentoPai = await prisma.lancamento.findFirst({
                    where: {
                        id: parseInt(lancamentoPaiId),
                        userId
                    }
                });

                if (!lancamentoPai) {
                    return res.status(404).json({error: 'Lançamento pai não encontrado'});
                }
            }

            // Validações de parcelamento
            if (numeroParcelas !== undefined && numeroParcelas !== null && numeroParcelas < 1) {
                return res.status(400).json({error: 'Número de parcelas deve ser maior que 0'});
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
            if (categoriaId !== undefined) {
                updateData.categoriaId = categoriaId ? parseInt(categoriaId) : null;
            }
            if (contaId !== undefined) {
                updateData.contaId = contaId ? parseInt(contaId) : null;
            }
            if (numeroParcelas !== undefined) {
                updateData.numeroParcelas = numeroParcelas ? parseInt(numeroParcelas) : null;
            }
            if (parcelaAtual !== undefined) {
                updateData.parcelaAtual = parcelaAtual ? parseInt(parcelaAtual) : null;
            }
            if (lancamentoPaiId !== undefined) {
                updateData.lancamentoPaiId = lancamentoPaiId ? parseInt(lancamentoPaiId) : null;
            }
            if (efetivado !== undefined) {
                updateData.efetivado = efetivado;
            }

            const lancamento = await prisma.lancamento.update({
                where: {id: lancamentoId},
                data: updateData,
                include: {
                    categoria: {
                        select: {
                            id: true,
                            nome: true
                        }
                    },
                    conta: {
                        select: {
                            id: true,
                            descricao: true
                        }
                    }
                }
            });

            res.json({
                message: 'Lançamento atualizado com sucesso',
                lancamento: {
                    id: lancamento.id,
                    descricao: lancamento.descricao,
                    valor: lancamento.valor,
                    data: lancamento.data,
                    tipo: lancamento.tipo,
                    userId: lancamento.userId,
                    categoriaId: lancamento.categoriaId,
                    contaId: lancamento.contaId,
                    numeroParcelas: lancamento.numeroParcelas,
                    parcelaAtual: lancamento.parcelaAtual,
                    lancamentoPaiId: lancamento.lancamentoPaiId,
                    efetivado: lancamento.efetivado,
                    categoria: lancamento.categoria,
                    conta: lancamento.conta
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar lançamento:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async deleteLancamento(req, res) {
        try {
            const lancamentoId = parseInt(req.params.id);
            const userId = req.user.id;

            const existingLancamento = await prisma.lancamento.findFirst({
                where: {
                    id: lancamentoId,
                    userId
                }
            });

            if (!existingLancamento) {
                return res.status(404).json({error: 'Lançamento não encontrado'});
            }

            await prisma.lancamento.delete({
                where: {id: lancamentoId}
            });

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar lançamento:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async createLancamentoParcelado(req, res) {
        try {
            const {descricao, valorTotal, dataInicial, tipo, categoriaId, contaId, numeroParcelas} = req.body;
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

            if (!numeroParcelas || numeroParcelas < 2) {
                return res.status(400).json({error: 'Número de parcelas deve ser maior ou igual a 2'});
            }

            // Validar se categoria existe e pertence ao usuário
            if (categoriaId) {
                const categoria = await prisma.category.findFirst({
                    where: {
                        id: parseInt(categoriaId),
                        userId
                    }
                });

                if (!categoria) {
                    return res.status(404).json({error: 'Categoria não encontrada'});
                }
            }

            // Validar se conta existe e pertence ao usuário
            if (contaId) {
                const conta = await prisma.conta.findFirst({
                    where: {
                        id: parseInt(contaId),
                        userId
                    }
                });

                if (!conta) {
                    return res.status(404).json({error: 'Conta não encontrada'});
                }
            }

            const valorParcela = parseFloat(valorTotal) / parseInt(numeroParcelas);
            const dataBase = new Date(dataInicial);
            const parcelas = [];

            // Criar lançamento pai
            const lancamentoPai = await prisma.lancamento.create({
                data: {
                    descricao: `${descricao} (Parcelado)`,
                    valor: parseFloat(valorTotal),
                    data: dataBase,
                    tipo,
                    userId,
                    categoriaId: categoriaId ? parseInt(categoriaId) : null,
                    contaId: contaId ? parseInt(contaId) : null,
                    numeroParcelas: parseInt(numeroParcelas),
                    parcelaAtual: 0
                }
            });

            // Criar parcelas
            for (let i = 1; i <= parseInt(numeroParcelas); i++) {
                const dataParcela = new Date(dataBase);
                dataParcela.setMonth(dataParcela.getMonth() + i - 1);

                const parcela = await prisma.lancamento.create({
                    data: {
                        descricao: `${descricao} (${i}/${numeroParcelas})`,
                        valor: valorParcela,
                        data: dataParcela,
                        tipo,
                        userId,
                        categoriaId: categoriaId ? parseInt(categoriaId) : null,
                        contaId: contaId ? parseInt(contaId) : null,
                        numeroParcelas: parseInt(numeroParcelas),
                        parcelaAtual: i,
                        lancamentoPaiId: lancamentoPai.id
                    },
                    include: {
                        categoria: {
                            select: {
                                id: true,
                                nome: true
                            }
                        },
                        conta: {
                            select: {
                                id: true,
                                descricao: true
                            }
                        }
                    }
                });

                parcelas.push(parcela);
            }

            res.status(201).json({
                message: 'Lançamento parcelado criado com sucesso',
                lancamentoPai: {
                    id: lancamentoPai.id,
                    descricao: lancamentoPai.descricao,
                    valorTotal: lancamentoPai.valor,
                    numeroParcelas: lancamentoPai.numeroParcelas
                },
                parcelas: parcelas.map(p => ({
                    id: p.id,
                    descricao: p.descricao,
                    valor: p.valor,
                    data: p.data,
                    parcelaAtual: p.parcelaAtual,
                    categoria: p.categoria,
                    conta: p.conta
                }))
            });
        } catch (error) {
            console.error('Erro ao criar lançamento parcelado:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    }
};

module.exports = lancamentoController;

