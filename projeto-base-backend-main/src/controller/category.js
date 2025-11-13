const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categoryController = {
  async getAllCategories(req, res) {
    try {
      const userId = req.user.id; // Pega do token via authMiddleware

      const categories = await prisma.category.findMany({
        where: { userId },
        select: {
          id: true,
          nome: true,
          userId: true
        }
      });

      res.json(categories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async getCategoryById(req, res) {
    try {
      const categoryId = parseInt(req.params.id);
      const userId = req.user.id;

      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId
        },
        select: {
          id: true,
          nome: true,
          userId: true
        }
      });

      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json(category);
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async createCategory(req, res) {
    try {
      const { nome } = req.body;
      const userId = req.user.id;

      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const category = await prisma.category.create({
        data: {
          nome,
          userId
        }
      });

      res.status(201).json({
        message: 'Categoria criada com sucesso',
        category: {
          id: category.id,
          nome: category.nome,
          userId: category.userId
        }
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async updateCategory(req, res) {
    try {
      const categoryId = parseInt(req.params.id);
      const { nome } = req.body;
      const userId = req.user.id;

      const existingCategory = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId
        }
      });

      if (!existingCategory) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const category = await prisma.category.update({
        where: { id: categoryId },
        data: {
          nome
        }
      });

      res.json({
        message: 'Categoria atualizada com sucesso',
        category: {
          id: category.id,
          nome: category.nome,
          userId: category.userId
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async deleteCategory(req, res) {
    try {
      const categoryId = parseInt(req.params.id);
      const userId = req.user.id;

      const existingCategory = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId
        }
      });

      if (!existingCategory) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      await prisma.category.delete({
        where: { id: categoryId }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = categoryController;

