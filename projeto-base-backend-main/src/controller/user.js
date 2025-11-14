const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

console.log('[USER-CONTROLLER] Prisma Client initialized');

/**
 * Validação de formato de email
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) => emailRegex.test(email);

/**
 * Gera mensagens de erro específicas baseado no tipo de login
 */
const getSpecificErrorMessage = (loginData, errorType) => {
  if (errorType === 'NOT_FOUND') {
    return loginData.isEmail 
      ? 'E-mail não cadastrado' 
      : 'Usuário não encontrado';
  }
  if (errorType === 'WRONG_PASSWORD') {
    return loginData.isEmail 
      ? 'E-mail ou senha incorretos' 
      : 'Usuário ou senha incorretos';
  }
  return 'Credenciais inválidas';
};

const userController = {
    /**
     * POST /auth/login
     * Autentica usuário por username OU email
     * Suporta Basic Auth com sanitização completa
     * Retorna dados do usuário e token codificado
     */
    async login(req, res) {
        try {
            // Dados sanitizados pelo middleware loginValidation
            const { login, password, isEmail, timestamp } = req.loginData;

            console.log(`📝 [LOGIN-CONTROLLER] Tentativa de login às ${timestamp}`);
            console.log(`   Tipo: ${isEmail ? 'Email' : 'Username'}`);
            console.log(`   Login: ${isEmail ? login.substring(0, 3) + '***' : login}`);

            // Buscar usuário com flexibilidade (username ou email)
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username: login },
                        { email: login }
                    ]
                }
            });

            // Validar existência do usuário
            if (!user) {
                console.log(`❌ [LOGIN-CONTROLLER] Usuário/email não encontrado: ${isEmail ? '***' : login}`);
                return res.status(401).json({ 
                    error: getSpecificErrorMessage({isEmail}, 'NOT_FOUND'),
                    code: 'USER_NOT_FOUND'
                });
            }

            // Validar senha
            if (user.password !== password) {
                console.log(`❌ [LOGIN-CONTROLLER] Senha incorreta para usuário: ${user.username} (ID: ${user.id})`);
                return res.status(401).json({ 
                    error: getSpecificErrorMessage({isEmail}, 'WRONG_PASSWORD'),
                    code: 'WRONG_PASSWORD'
                });
            }

            // Sucesso!
            console.log(`✅ [LOGIN-CONTROLLER] Login bem-sucedido para: ${user.username} (ID: ${user.id}, Admin: ${user.isAdmin})`);
            
            res.status(200).json({
                message: 'Login bem-sucedido',
                code: 'LOGIN_SUCCESS',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.isAdmin
                },
                token: Buffer.from(`${login}:${password}`).toString('base64'),
                loginType: isEmail ? 'email' : 'username'
            });

        } catch (error) {
            console.error('❌ [LOGIN-CONTROLLER] Erro inesperado:', error.message);
            console.error('   Stack:', error.stack);
            res.status(500).json({ 
                error: 'Erro interno do servidor',
                code: 'SERVER_ERROR',
                details: error.message
            });
        }
    },

    /**
     * POST /auth/register
     * Registra novo usuário com username obrigatório
     * Email é opcional e único quando fornecido
     * Primeiro usuário é automaticamente admin
     */
    async register(req, res) {
        try {
            const {username, password, email} = req.body;

            console.log(`📝 [REGISTER-CONTROLLER] Tentativa de registro`);
            console.log(`   Username: ${username}`);
            console.log(`   Email: ${email ? email.substring(0, 3) + '***' : 'não fornecido'}`);

            // Validação: username e password obrigatórios
            if (!username || !password) {
                console.log('❌ [REGISTER-CONTROLLER] Username ou password faltando');
                return res.status(400).json({
                    error: 'Username e password são obrigatórios',
                    code: 'MISSING_REQUIRED_FIELDS'
                });
            }

            // Validação: tamanho mínimo de password
            if (password.length < 4) {
                console.log('❌ [REGISTER-CONTROLLER] Password muito curta');
                return res.status(400).json({
                    error: 'Password deve ter no mínimo 4 caracteres',
                    code: 'PASSWORD_TOO_SHORT'
                });
            }

            // Validação: formato de email se fornecido
            if (email && !isValidEmail(email.trim())) {
                console.log('❌ [REGISTER-CONTROLLER] Formato de email inválido:', email);
                return res.status(400).json({
                    error: 'Formato de email inválido',
                    code: 'INVALID_EMAIL_FORMAT'
                });
            }

            // Determinar se será admin (primeiro usuário)
            const userCount = await prisma.user.count();
            const isAdmin = userCount === 0;

            // Criar usuário
            const user = await prisma.user.create({
                data: {
                    username: username.trim(),
                    email: email ? email.trim().toLowerCase() : null,
                    password: password.trim(),
                    isAdmin
                }
            });

            console.log(`✅ [REGISTER-CONTROLLER] Usuário criado com sucesso: ${user.username} (ID: ${user.id}, Admin: ${isAdmin})`);

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                code: 'USER_CREATED',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.isAdmin
                },
                isFirstUser: isAdmin
            });

        } catch (error) {
            // Erro de constraint única (username ou email duplicado)
            if (error.code === 'P2002') {
                const field = error.meta?.target?.[0];
                console.log(`❌ [REGISTER-CONTROLLER] Duplicata detectada no campo: ${field}`);
                
                if (field === 'username') {
                    return res.status(400).json({
                        error: 'Username já existe',
                        code: 'USERNAME_ALREADY_EXISTS',
                        field: 'username'
                    });
                } else if (field === 'email') {
                    return res.status(400).json({
                        error: 'Email já está registrado',
                        code: 'EMAIL_ALREADY_EXISTS',
                        field: 'email'
                    });
                }
            }
            
            console.error('❌ [REGISTER-CONTROLLER] Erro inesperado:', error.message);
            res.status(500).json({
                error: 'Erro ao registrar usuário',
                code: 'SERVER_ERROR'
            });
        }
    },

    async getUsers(req, res) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    email: true,
                    isAdmin: true
                }
            });

            console.log(`✓ [GETUSERS] Listados ${users.length} usuários`);
            res.status(200).json(users);
        } catch (error) {
            console.error('❌ [GETUSERS] Erro:', error.message);
            res.status(500).json({
                error: 'Erro ao listar usuários',
                code: 'SERVER_ERROR'
            });
        }
    },

    async getUserById(req, res) {
        try {
            const {id} = req.params;
            const userId = parseInt(id);

            if (isNaN(userId)) {
                return res.status(400).json({
                    error: 'ID inválido',
                    code: 'INVALID_ID'
                });
            }

            const user = await prisma.user.findUnique({
                where: {id: userId},
                select: {
                    id: true,
                    username: true,
                    email: true,
                    isAdmin: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('❌ [GETUSERBYID] Erro:', error.message);
            res.status(500).json({
                error: 'Erro ao buscar usuário',
                code: 'SERVER_ERROR'
            });
        }
    },

    async deleteUser(req, res) {
        try {
            const {id} = req.params;
            const userId = parseInt(id);

            if (isNaN(userId)) {
                return res.status(400).json({
                    error: 'ID inválido',
                    code: 'INVALID_ID'
                });
            }

            const user = await prisma.user.findUnique({
                where: {id: userId}
            });

            if (!user) {
                return res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }

            await prisma.user.delete({
                where: {id: userId}
            });

            console.log(`✓ [DELETEUSER] Usuário deletado: ${user.username} (ID: ${userId})`);
            res.status(204).send();
        } catch (error) {
            console.error('❌ [DELETEUSER] Erro:', error.message);
            res.status(500).json({
                error: 'Erro ao deletar usuário',
                code: 'SERVER_ERROR'
            });
        }
    },

    async updateUserAdmin(req, res) {
        try {
            const {id} = req.params;
            const {isAdmin} = req.body;
            const userId = parseInt(id);

            if (isNaN(userId)) {
                return res.status(400).json({
                    error: 'ID inválido',
                    code: 'INVALID_ID'
                });
            }

            if (typeof isAdmin !== 'boolean') {
                return res.status(400).json({
                    error: 'isAdmin deve ser um boolean',
                    code: 'INVALID_ISADMIN_TYPE'
                });
            }

            const user = await prisma.user.findUnique({
                where: {id: userId}
            });

            if (!user) {
                return res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }

            const updatedUser = await prisma.user.update({
                where: {id: userId},
                data: {isAdmin},
                select: {
                    id: true,
                    username: true,
                    email: true,
                    isAdmin: true
                }
            });

            console.log(`✓ [UPDATEADMIN] Usuário ${user.username} atualizado: isAdmin=${isAdmin}`);
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('❌ [UPDATEADMIN] Erro:', error.message);
            res.status(500).json({
                error: 'Erro ao atualizar usuário',
                code: 'SERVER_ERROR'
            });
        }
    },

    /**
     * PUT /api/users/:id/email
     * Permite que usuários adicionem ou atualizem seu email
     * Email é opcional e único quando fornecido
     */
    async updateUserEmail(req, res) {
        try {
            const {id} = req.params;
            const {email} = req.body;
            const userId = parseInt(id);

            if (isNaN(userId)) {
                return res.status(400).json({
                    error: 'ID inválido',
                    code: 'INVALID_ID'
                });
            }

            if (!email || typeof email !== 'string') {
                return res.status(400).json({
                    error: 'Email é obrigatório',
                    code: 'MISSING_EMAIL'
                });
            }

            // Validar formato de email
            const trimmedEmail = email.trim().toLowerCase();
            if (!isValidEmail(trimmedEmail)) {
                return res.status(400).json({
                    error: 'Formato de email inválido',
                    code: 'INVALID_EMAIL_FORMAT'
                });
            }

            const user = await prisma.user.findUnique({
                where: {id: userId}
            });

            if (!user) {
                return res.status(404).json({
                    error: 'Usuário não encontrado',
                    code: 'USER_NOT_FOUND'
                });
            }

            const updatedUser = await prisma.user.update({
                where: {id: userId},
                data: {email: trimmedEmail},
                select: {
                    id: true,
                    username: true,
                    email: true,
                    isAdmin: true
                }
            });

            console.log(`✓ [UPDATEEMAIL] Email adicionado ao usuário: ${user.username} (ID: ${userId})`);
            res.status(200).json({
                message: 'Email atualizado com sucesso',
                code: 'EMAIL_UPDATED',
                user: updatedUser
            });

        } catch (error) {
            // Erro de constraint única (email duplicado)
            if (error.code === 'P2002') {
                console.log('❌ [UPDATEEMAIL] Email duplicado');
                return res.status(400).json({
                    error: 'Email já está registrado',
                    code: 'EMAIL_ALREADY_EXISTS'
                });
            }
            
            console.error('❌ [UPDATEEMAIL] Erro inesperado:', error.message);
            res.status(500).json({
                error: 'Erro ao atualizar email',
                code: 'SERVER_ERROR'
            });
        }
    },

    /**
     * GET /api/users/check/availability
     * Verifica disponibilidade de username e/ou email
     * Query params: ?username=xxx&email=yyy
     * Retorna: { available: boolean, username: { available, reason }, email: { available, reason } }
     */
    async checkAvailability(req, res) {
        try {
            const { username, email } = req.query;

            console.log(`📋 [CHECK-AVAILABILITY] Verificando disponibilidade`);

            const result = {
                available: true,
                username: null,
                email: null,
                timestamp: new Date().toISOString()
            };

            // Verificar username se fornecido
            if (username && username.trim()) {
                const trimmedUsername = username.trim();
                const userExists = await prisma.user.findUnique({
                    where: { username: trimmedUsername }
                });

                result.username = {
                    requested: trimmedUsername,
                    available: !userExists,
                    reason: userExists ? 'Username já existe' : 'Disponível'
                };

                if (userExists) result.available = false;
                console.log(`   Username '${trimmedUsername}': ${result.username.available ? '✓ Disponível' : '✗ Em uso'}`);
            }

            // Verificar email se fornecido
            if (email && email.trim()) {
                const trimmedEmail = email.trim().toLowerCase();
                
                // Validar formato
                if (!isValidEmail(trimmedEmail)) {
                    result.email = {
                        requested: trimmedEmail,
                        available: false,
                        reason: 'Formato de email inválido'
                    };
                    result.available = false;
                } else {
                    const emailExists = await prisma.user.findUnique({
                        where: { email: trimmedEmail }
                    });

                    result.email = {
                        requested: trimmedEmail.substring(0, 3) + '***',
                        available: !emailExists,
                        reason: emailExists ? 'Email já está registrado' : 'Disponível'
                    };

                    if (emailExists) result.available = false;
                    console.log(`   Email '***': ${result.email.available ? '✓ Disponível' : '✗ Em uso'}`);
                }
            }

            res.status(200).json(result);

        } catch (error) {
            console.error('❌ [CHECK-AVAILABILITY] Erro:', error.message);
            res.status(500).json({
                error: 'Erro ao verificar disponibilidade',
                code: 'SERVER_ERROR'
            });
        }
    }
};

module.exports = userController;
