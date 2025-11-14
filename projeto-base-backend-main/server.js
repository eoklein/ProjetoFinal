const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const tipoPatrimonioRoutes = require('./src/routes/tiposPatrimonio');
const patrimonioRoutes = require('./src/routes/patrimonios');
const estoqueRoutes = require('./src/routes/estoque');
const reservaRoutes = require('./src/routes/reservas');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires']
}));

app.use(express.json());

// Desabilitar cache para todas as rotas GET
app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tiposPatrimonio', tipoPatrimonioRoutes);
app.use('/patrimonios', patrimonioRoutes);
app.use('/lancamentos', estoqueRoutes);
app.use('/reservas', reservaRoutes);

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
      },
      reservas: {
        'GET /reservas': 'Listar todas as reservas do usuário (auth required)',
        'GET /reservas/disponivel': 'Listar patrimônios disponíveis para reserva (auth required)',
        'POST /reservas': 'Criar nova reserva (auth required)',
        'PUT /reservas/:id': 'Atualizar reserva (auth required)',
        'DELETE /reservas/:id': 'Deletar reserva (auth required)',
        'GET /reservas/admin/verificar-consistencia/:patrimonioId': 'Verificar consistência de status (admin only)',
        'POST /reservas/admin/reparar-consistencia/:patrimonioId': 'Reparar inconsistências de status (admin only)'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(` Servidor rodando na porta ${PORT}`);
  console.log(` API Biblioteca disponível em: http://localhost:${PORT}`);
});
