const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Sincroniza o status entre as tabelas: Reserva, Patrimonio e Estoque
 * 
 * Status válidos: 'reservado', 'devolvido', 'cancelado', 'bom', 'critico', 'danificado'
 * 
 * Fluxo:
 * - Quando uma RESERVA muda de status → atualiza PATRIMONIO e ESTOQUE
 * - Quando um PATRIMONIO é criado → status é null
 * - Quando uma RESERVA é deletada → status volta para null
 */

const statusSync = {
    /**
     * Sincronizar status da reserva para patrimonio e estoque
     * @param {number} patrimonioId - ID do patrimonio
     * @param {string} status - novo status ('reservado', 'devolvido', 'cancelado')
     */
    async syncPatrimonioStatus(patrimonioId, status) {
        try {
            if (!patrimonioId) {
                throw new Error('patrimonioId é obrigatório');
            }

            // Validar status
            const statusValidos = ['reservado', 'devolvido', 'cancelado', null];
            if (status && !statusValidos.includes(status.toLowerCase())) {
                throw new Error(`Status inválido: ${status}`);
            }

            const statusFormatado = status ? status.toLowerCase() : null;

            // Atualizar patrimonio
            await prisma.patrimonio.update({
                where: { id: patrimonioId },
                data: { status: statusFormatado }
            });

            // Atualizar todos os estoques relacionados
            await prisma.estoque.updateMany({
                where: { patrimonioId: patrimonioId },
                data: { status: statusFormatado }
            });

            console.log(`✅ Status sincronizado para patrimonio ${patrimonioId}: ${statusFormatado || 'null'}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao sincronizar status:', error.message);
            throw error;
        }
    },

    /**
     * Verificar se patrimonio tem reserva ativa
     * @param {number} patrimonioId - ID do patrimonio
     * @returns {Promise<Object|null>} - Reserva ativa ou null
     */
    async getReservaAtiva(patrimonioId) {
        try {
            const reserva = await prisma.reserva.findFirst({
                where: {
                    patrimonioId,
                    status: 'reservado'
                }
            });
            return reserva || null;
        } catch (error) {
            console.error('❌ Erro ao buscar reserva ativa:', error.message);
            throw error;
        }
    },

    /**
     * Limpar status quando reserva é deletada
     * @param {number} patrimonioId - ID do patrimonio
     */
    async clearPatrimonioStatus(patrimonioId) {
        return this.syncPatrimonioStatus(patrimonioId, null);
    },

    /**
     * Obter status completo de um patrimonio com todas as relações
     * @param {number} patrimonioId - ID do patrimonio
     * @returns {Promise<Object>} - Informações completas do patrimonio e suas relações
     */
    async getPatrimonioStatusCompleto(patrimonioId) {
        try {
            const patrimonio = await prisma.patrimonio.findUnique({
                where: { id: patrimonioId },
                include: {
                    reservas: {
                        where: { status: 'reservado' },
                        select: {
                            id: true,
                            status: true,
                            dataDevolucao: true,
                            user: { select: { username: true } }
                        }
                    },
                    estoques: {
                        select: {
                            id: true,
                            status: true,
                            tipo: true,
                            efetivado: true
                        }
                    }
                }
            });

            if (!patrimonio) {
                throw new Error('Patrimonio não encontrado');
            }

            return {
                patrimonio: {
                    id: patrimonio.id,
                    nome: patrimonio.nome,
                    status: patrimonio.status
                },
                reservaAtiva: patrimonio.reservas[0] || null,
                estoques: patrimonio.estoques,
                statusConsistente: this.verificarConsistencia(patrimonio)
            };
        } catch (error) {
            console.error('❌ Erro ao buscar status completo:', error.message);
            throw error;
        }
    },

    /**
     * Verificar se status está consistente entre tabelas
     * @param {Object} patrimonio - Objeto patrimonio com relações incluídas
     * @returns {boolean}
     */
    verificarConsistencia(patrimonio) {
        // Se tem reserva ativa, status deve ser 'reservado'
        const temReservaAtiva = patrimonio.reservas && patrimonio.reservas.length > 0;
        const statusPatrimonio = patrimonio.status;

        if (temReservaAtiva && statusPatrimonio !== 'reservado') {
            return false;
        }

        // Verificar se todos os estoques têm o mesmo status
        if (patrimonio.estoques && patrimonio.estoques.length > 0) {
            const statusesEstoque = new Set(patrimonio.estoques.map(e => e.status));
            if (statusesEstoque.size > 1 || (statusesEstoque.size === 1 && Array.from(statusesEstoque)[0] !== statusPatrimonio)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Reparar inconsistências de status
     * @param {number} patrimonioId - ID do patrimonio
     */
    async repararConsistencia(patrimonioId) {
        try {
            const patrimonio = await prisma.patrimonio.findUnique({
                where: { id: patrimonioId },
                include: {
                    reservas: {
                        where: { status: 'reservado' }
                    }
                }
            });

            if (!patrimonio) {
                throw new Error('Patrimonio não encontrado');
            }

            // Determinar status correto baseado em reserva
            const statusCorreto = patrimonio.reservas.length > 0 ? 'reservado' : null;

            // Sincronizar
            await this.syncPatrimonioStatus(patrimonioId, statusCorreto);

            console.log(`✅ Consistência reparada para patrimonio ${patrimonioId}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao reparar consistência:', error.message);
            throw error;
        }
    }
};

module.exports = statusSync;
