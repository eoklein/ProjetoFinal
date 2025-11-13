const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tipoPatrimonioController = {
  async getAllTiposPatrimonio(req, res) {
    try {
      const tiposPatrimonio = await prisma.tipoPatrimonio.findMany({
        select: {
          id: true,
          nome: true,
          userId: true
        }
      });

      res.json(tiposPatrimonio);
    } catch (error) {
      console.error('Erro ao buscar tipos de patrimonio:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async getTipoPatrimonioById(req, res) {
    try {
      const tipoPatrimonioId = parseInt(req.params.id);

      const tipoPatrimonio = await prisma.tipoPatrimonio.findUnique({
        where: {
          id: tipoPatrimonioId
        },
        select: {
          id: true,
          nome: true,
          userId: true
        }
      });

      if (!tipoPatrimonio) {
        return res.status(404).json({ error: 'Tipo de patrimonio não encontrado' });
      }

      res.json(tipoPatrimonio);
    } catch (error) {
      console.error('Erro ao buscar tipo de patrimonio:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async createTipoPatrimonio(req, res) {
    try {
      const { nome } = req.body;
      const userId = req.user.id;

      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const tipoPatrimonio = await prisma.tipoPatrimonio.create({
        data: {
          nome,
          userId
        }
      });

      res.status(201).json({
        message: 'Tipo de patrimonio criado com sucesso',
        tipoPatrimonio: {
          id: tipoPatrimonio.id,
          nome: tipoPatrimonio.nome,
          userId: tipoPatrimonio.userId
        }
      });
    } catch (error) {
      console.error('Erro ao criar tipo de patrimonio:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async updateTipoPatrimonio(req, res) {
    try {
      const tipoPatrimonioId = parseInt(req.params.id);
      const { nome } = req.body;

      const existingTipoPatrimonio = await prisma.tipoPatrimonio.findUnique({
        where: {
          id: tipoPatrimonioId
        }
      });

      if (!existingTipoPatrimonio) {
        return res.status(404).json({ error: 'Tipo de patrimonio não encontrado' });
      }

      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const tipoPatrimonio = await prisma.tipoPatrimonio.update({
        where: { id: tipoPatrimonioId },
        data: {
          nome
        }
      });

      res.json({
        message: 'Tipo de patrimonio atualizado com sucesso',
        tipoPatrimonio: {
          id: tipoPatrimonio.id,
          nome: tipoPatrimonio.nome,
          userId: tipoPatrimonio.userId
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar tipo de patrimonio:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async deleteTipoPatrimonio(req, res) {
    try {
      const tipoPatrimonioId = parseInt(req.params.id);

      const existingTipoPatrimonio = await prisma.tipoPatrimonio.findUnique({
        where: {
          id: tipoPatrimonioId
        }
      });

      if (!existingTipoPatrimonio) {
        return res.status(404).json({ error: 'Tipo de patrimonio não encontrado' });
      }

      await prisma.tipoPatrimonio.delete({
        where: { id: tipoPatrimonioId }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar tipo de patrimonio:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = tipoPatrimonioController;
