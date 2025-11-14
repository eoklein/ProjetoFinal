const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware de autenticação atualizado
 * - Suporta login por username OU email
 * - Valida password
 * - Armazena user em req.user
 * - Logs estruturados
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      console.log('❌ [AUTH] Sem header de autenticação ou formato inválido');
      return res.status(401).json({ 
        error: 'Token de autenticação necessário',
        code: 'NO_AUTH_HEADER'
      });
    }

    const token = authHeader.substring(6);
    let decoded;
    try {
      decoded = Buffer.from(token, 'base64').toString('utf-8');
    } catch (error) {
      console.log('❌ [AUTH] Token Base64 inválido');
      return res.status(401).json({ 
        error: 'Token inválido',
        code: 'INVALID_BASE64'
      });
    }

    const [login, password] = decoded.split(':');

    if (!login || !password) {
      console.log('❌ [AUTH] Login ou password vazios');
      return res.status(401).json({ 
        error: 'Token inválido',
        code: 'EMPTY_CREDENTIALS'
      });
    }

    // Buscar usuário por username OU email (compatível com ambos os formatos)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: login.trim() },
          { email: login.trim().toLowerCase() }
        ]
      }
    });

    if (!user || user.password !== password.trim()) {
      console.log('❌ [AUTH] Credenciais inválidas para:', login);
      return res.status(401).json({ 
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    req.user = user;
    console.log(`✓ [AUTH] Usuário autenticado: ${user.username} (ID: ${user.id}, Admin: ${user.isAdmin})`);
    next();
  } catch (error) {
    console.error('❌ [AUTH] Erro inesperado:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = authMiddleware;