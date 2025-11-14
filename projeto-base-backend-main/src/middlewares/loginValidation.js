/**
 * Middleware de validação para login
 * - Valida formato de Basic Auth
 * - Sanitiza dados (email lowercase, trim)
 * - Estrutura logs
 * - Detecta tipo de login (username vs email)
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginValidationMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Validar presença do header
    if (!authHeader) {
      console.log('❌ [LOGIN-VALIDATION] Sem header de autenticação');
      return res.status(401).json({ 
        error: 'Token de autenticação necessário',
        code: 'NO_AUTH_HEADER'
      });
    }

    // Validar formato Basic Auth
    if (!authHeader.startsWith('Basic ')) {
      console.log('❌ [LOGIN-VALIDATION] Formato inválido do header:', authHeader.substring(0, 20));
      return res.status(401).json({ 
        error: 'Formato de autenticação inválido. Use Basic Auth',
        code: 'INVALID_AUTH_FORMAT'
      });
    }

    // Decodificar token Base64
    let decoded;
    try {
      const token = authHeader.substring(6);
      decoded = Buffer.from(token, 'base64').toString('utf-8');
    } catch (error) {
      console.log('❌ [LOGIN-VALIDATION] Token Base64 inválido');
      return res.status(401).json({ 
        error: 'Token inválido. Não é Base64 válido',
        code: 'INVALID_BASE64'
      });
    }

    // Dividir credenciais
    const parts = decoded.split(':');
    if (parts.length !== 2) {
      console.log('❌ [LOGIN-VALIDATION] Formato de credenciais inválido');
      return res.status(401).json({ 
        error: 'Credenciais devem estar no formato login:password',
        code: 'INVALID_CREDENTIALS_FORMAT'
      });
    }

    let [login, password] = parts;

    // Validar presença de campos
    if (!login || !password) {
      console.log('❌ [LOGIN-VALIDATION] Login ou password vazios');
      return res.status(401).json({ 
        error: 'Login e password são obrigatórios',
        code: 'EMPTY_CREDENTIALS'
      });
    }

    // Sanitizar dados
    login = login.trim();
    password = password.trim();

    // Detectar tipo de login e sanitizar apropriadamente
    const isEmail = emailRegex.test(login);
    
    if (isEmail) {
      login = login.toLowerCase();
      console.log(`📧 [LOGIN-VALIDATION] Email detectado: ${login.substring(0, 3)}***`);
    } else {
      console.log(`👤 [LOGIN-VALIDATION] Username detectado: ${login}`);
    }

    // Armazenar dados sanitizados no objeto request
    req.loginData = {
      login,
      password,
      isEmail,
      timestamp: new Date().toISOString()
    };

    console.log(`✓ [LOGIN-VALIDATION] Validação bem-sucedida - Tipo: ${isEmail ? 'email' : 'username'}`);
    next();

  } catch (error) {
    console.error('❌ [LOGIN-VALIDATION] Erro inesperado:', error.message);
    res.status(500).json({ 
      error: 'Erro ao validar autenticação',
      code: 'VALIDATION_ERROR'
    });
  }
};

module.exports = loginValidationMiddleware;
