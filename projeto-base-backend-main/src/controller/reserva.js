const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const reservaController = {
    async getAllReservas(req, res) {
        try {
            const userId = req.user.id;
            const isAdmin = req.user.isAdmin;

            // Admin vê todas as reservas, usuário comum vê apenas suas próprias
            const whereClause = isAdmin ? {} : { userId };

            const reservas = await prisma.reserva.findMany({
                where: whereClause,
                include: {
                    patrimonio: {
                        select: {
                            id: true,
                            nome: true,
                            codigo: true,
                            status: true,
                            valor: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                },
                orderBy: {
                    dataReserva: 'desc'
                }
            });

            res.json(reservas);
        } catch (error) {
            console.error('Erro ao buscar reservas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async getPatrimoniosDisponiveis(req, res) {
        try {
            const userId = req.user.id;

            // Buscar patrimônios que NÃO têm reservas ativas
            const patrimonios = await prisma.patrimonio.findMany({
                where: {
                    userId,
                    reservas: {
                        none: {
                            status: 'ativa'
                        }
                    }
                },
                select: {
                    id: true,
                    nome: true,
                    codigo: true,
                    status: true,
                    valor: true
                },
                orderBy: {
                    nome: 'asc'
                }
            });

            res.json(patrimonios);
        } catch (error) {
            console.error('Erro ao buscar patrimônios disponíveis:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async createReserva(req, res) {
        try {
            const { patrimonioId, dataDevolucao, userId: specifiedUserId } = req.body;
            const currentUserId = req.user.id;
            const isAdmin = req.user.isAdmin;

            if (!patrimonioId) {
                return res.status(400).json({ error: 'Patrimônio é obrigatório' });
            }

            if (!dataDevolucao) {
                return res.status(400).json({ error: 'Data de devolução é obrigatória' });
            }

            // Determinar qual userId usar
            let finalUserId = currentUserId;
            if (isAdmin && specifiedUserId) {
                finalUserId = specifiedUserId;
                
                // Verificar se o usuário especificado existe
                const usuarioExists = await prisma.user.findUnique({
                    where: { id: finalUserId }
                });
                
                if (!usuarioExists) {
                    return res.status(404).json({ error: 'Usuário não encontrado' });
                }
            } else if (!isAdmin && specifiedUserId && specifiedUserId !== currentUserId) {
                return res.status(403).json({ error: 'Você não tem permissão para criar reserva para outro usuário' });
            }

            // Verificar se o patrimônio existe
            const patrimonio = await prisma.patrimonio.findUnique({
                where: { id: patrimonioId }
            });

            if (!patrimonio) {
                return res.status(404).json({ error: 'Patrimônio não encontrado' });
            }

            // Verificar se já existe uma reserva ativa para este patrimônio
            const reservaExistente = await prisma.reserva.findFirst({
                where: {
                    patrimonioId,
                    status: 'ativa'
                }
            });

            if (reservaExistente) {
                return res.status(400).json({ error: 'Este patrimônio já possui uma reserva ativa' });
            }

            // Validar data de devolução
            const dataDev = new Date(dataDevolucao);
            const hoje = new Date();
            
            if (dataDev <= hoje) {
                return res.status(400).json({ error: 'Data de devolução deve ser futura' });
            }

            const reserva = await prisma.reserva.create({
                data: {
                    patrimonioId,
                    userId: finalUserId,
                    dataDevolucao: dataDev,
                    status: 'ativa'
                },
                include: {
                    patrimonio: {
                        select: {
                            id: true,
                            nome: true,
                            codigo: true,
                            status: true,
                            valor: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                }
            });

            res.status(201).json({
                message: 'Reserva criada com sucesso',
                reserva
            });
        } catch (error) {
            console.error('Erro ao criar reserva:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async updateReserva(req, res) {
        try {
            const reservaId = parseInt(req.params.id);
            const { dataDevolucao, status, userId: specifiedUserId } = req.body;
            const currentUserId = req.user.id;
            const isAdmin = req.user.isAdmin;

            const reserva = await prisma.reserva.findUnique({
                where: { id: reservaId }
            });

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva não encontrada' });
            }

            // Verificar permissões
            if (!isAdmin && reserva.userId !== currentUserId) {
                return res.status(403).json({ error: 'Você não tem permissão para atualizar esta reserva' });
            }

            const updateData = {};
            
            if (dataDevolucao) {
                const dataDev = new Date(dataDevolucao);
                const hoje = new Date();
                
                if (dataDev <= hoje) {
                    return res.status(400).json({ error: 'Data de devolução deve ser futura' });
                }
                updateData.dataDevolucao = dataDev;
            }

            if (status) {
                const statusValidos = ['ativa', 'devolvido', 'cancelado'];
                if (!statusValidos.includes(status)) {
                    return res.status(400).json({ error: 'Status inválido' });
                }
                updateData.status = status;
            }

            if (isAdmin && specifiedUserId) {
                // Verificar se o usuário existe
                const usuarioExists = await prisma.user.findUnique({
                    where: { id: specifiedUserId }
                });
                
                if (!usuarioExists) {
                    return res.status(404).json({ error: 'Usuário não encontrado' });
                }
                updateData.userId = specifiedUserId;
            }

            const reservaAtualizada = await prisma.reserva.update({
                where: { id: reservaId },
                data: updateData,
                include: {
                    patrimonio: {
                        select: {
                            id: true,
                            nome: true,
                            codigo: true,
                            status: true,
                            valor: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            username: true
                        }
                    }
                }
            });

            res.json({
                message: 'Reserva atualizada com sucesso',
                reserva: reservaAtualizada
            });
        } catch (error) {
            console.error('Erro ao atualizar reserva:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async deleteReserva(req, res) {
        try {
            const reservaId = parseInt(req.params.id);
            const currentUserId = req.user.id;
            const isAdmin = req.user.isAdmin;

            const reserva = await prisma.reserva.findUnique({
                where: { id: reservaId }
            });

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva não encontrada' });
            }

            // Verificar permissões
            if (!isAdmin && reserva.userId !== currentUserId) {
                return res.status(403).json({ error: 'Você não tem permissão para deletar esta reserva' });
            }

            await prisma.reserva.delete({
                where: { id: reservaId }
            });

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar reserva:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};

module.exports = reservaController;
