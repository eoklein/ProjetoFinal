const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth');
const bookRoutes = require('./src/routes/books');
const userRoutes = require('./src/routes/users');
const tipoPatrimonioRoutes = require('./src/routes/tiposPatrimonio');
const patrimonioRoutes = require('./src/routes/patrimonios');
const lancamentoRoutes = require('./src/routes/lancamentos');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/users', userRoutes);
app.use('/tiposPatrimonio', tipoPatrimonioRoutes);
app.use('/patrimonios', patrimonioRoutes);
app.use('/lancamentos', lancamentoRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'API Sistema de Biblioteca',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /auth/login': 'Login (retorna token)',
        'POST /auth/register': 'Registrar novo usuário'
      },
      users: {
        'GET /users': 'Listar todos os usuários (admin only)',
        'GET /users/:id': 'Buscar usuário por ID (admin only)',
        'DELETE /users/:id': 'Deletar usuário (admin only)',
        'PATCH /users/:id/admin': 'Atualizar status de admin (admin only)'
      },
      books: {
        'GET /books': 'Listar todos os livros (auth required)',
        'GET /books/:id': 'Buscar livro por ID (auth required)',
        'POST /books': 'Criar livro (admin only)',
        'PATCH /books/:id': 'Atualizar livro (admin only)',
        'DELETE /books/:id': 'Deletar livro (admin only)',
        'POST /books/:id/borrow': 'Pegar livro emprestado (auth required)',
        'POST /books/:id/return': 'Devolver livro (auth required)'
      },
      tiposPatrimonio: {
        'GET /tiposPatrimonio': 'Listar todos os tipos de patrimonio (auth required)',
        'GET /tiposPatrimonio/:id': 'Buscar tipo de patrimonio por ID (auth required)',
        'POST /tiposPatrimonio': 'Criar tipo de patrimonio (auth required)',
        'PUT /tiposPatrimonio/:id': 'Atualizar tipo de patrimonio (auth required)',
        'DELETE /tiposPatrimonio/:id': 'Deletar tipo de patrimonio (auth required)'
      },
      patrimonios: {
        'GET /patrimonios': 'Listar todos os patrimonios (auth required)',
        'GET /patrimonios/:id': 'Buscar patrimonio por ID (auth required)',
        'POST /patrimonios': 'Criar patrimonio (auth required)',
        'PUT /patrimonios/:id': 'Atualizar patrimonio (auth required)',
        'DELETE /patrimonios/:id': 'Deletar patrimonio (auth required)'
      },
      estoques: {
        'GET /lancamentos': 'Listar todos os estoques (auth required)',
        'GET /lancamentos/:id': 'Buscar estoque por ID (auth required)',
        'POST /lancamentos': 'Criar estoque (auth required)',
        'POST /lancamentos/com-retiradas': 'Criar estoque com retiradas (auth required)',
        'PUT /lancamentos/:id': 'Atualizar estoque (auth required)',
        'DELETE /lancamentos/:id': 'Deletar estoque (auth required)'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(` Servidor rodando na porta ${PORT}`);
  console.log(` API Biblioteca disponível em: http://localhost:${PORT}`);
});
