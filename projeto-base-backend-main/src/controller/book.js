const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bookController = {
  async getAllBooks(req, res) {
    try {
      const books = await prisma.book.findMany({
        select: {
          id: true,
          title: true,
          author: true,
          available: true
        }
      });

      res.json(books);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async getBookById(req, res) {
    try {
      const bookId = parseInt(req.params.id);

      const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: {
          id: true,
          title: true,
          author: true,
          available: true
        }
      });

      if (!book) {
        return res.status(404).json({ error: 'Livro não encontrado' });
      }

      res.json(book);
    } catch (error) {
      console.error('Erro ao buscar livro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async createBook(req, res) {
    try {
      const { title, author } = req.body;

      if (!title || !author) {
        return res.status(400).json({ error: 'Title e author são obrigatórios' });
      }

      const book = await prisma.book.create({
        data: {
          title,
          author
        }
      });

      res.status(201).json({
        message: 'Livro criado com sucesso',
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          available: book.available
        }
      });
    } catch (error) {
      console.error('Erro ao criar livro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async updateBook(req, res) {
    try {
      const bookId = parseInt(req.params.id);
      const { title, author, available } = req.body;

      const existingBook = await prisma.book.findUnique({
        where: { id: bookId }
      });

      if (!existingBook) {
        return res.status(404).json({ error: 'Livro não encontrado' });
      }

      const book = await prisma.book.update({
        where: { id: bookId },
        data: {
          title: title !== undefined ? title : existingBook.title,
          author: author !== undefined ? author : existingBook.author,
          available: available !== undefined ? available : existingBook.available
        }
      });

      res.json({
        message: 'Livro atualizado com sucesso',
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          available: book.available
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar livro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async deleteBook(req, res) {
    try {
      const bookId = parseInt(req.params.id);

      const existingBook = await prisma.book.findUnique({
        where: { id: bookId }
      });

      if (!existingBook) {
        return res.status(404).json({ error: 'Livro não encontrado' });
      }

      await prisma.book.delete({
        where: { id: bookId }
      });

      res.json({ message: 'Livro removido com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar livro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async borrowBook(req, res) {
    try {
      const bookId = parseInt(req.params.id);

      const book = await prisma.book.findUnique({
        where: { id: bookId }
      });

      if (!book) {
        return res.status(404).json({ error: 'Livro não encontrado' });
      }

      if (!book.available) {
        return res.status(400).json({ error: 'Livro não está disponível para empréstimo' });
      }

      await prisma.book.update({
        where: { id: bookId },
        data: { available: false }
      });

      res.json({ message: 'Livro emprestado com sucesso' });
    } catch (error) {
      console.error('Erro ao pegar livro emprestado:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async returnBook(req, res) {
    try {
      const bookId = parseInt(req.params.id);

      const book = await prisma.book.findUnique({
        where: { id: bookId }
      });

      if (!book) {
        return res.status(404).json({ error: 'Livro não encontrado' });
      }

      if (book.available) {
        return res.status(400).json({ error: 'Livro já está disponível' });
      }

      await prisma.book.update({
        where: { id: bookId },
        data: { available: true }
      });

      res.json({ message: 'Livro devolvido com sucesso' });
    } catch (error) {
      console.error('Erro ao devolver livro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = bookController;