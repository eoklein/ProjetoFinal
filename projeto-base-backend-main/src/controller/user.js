const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const userController = {
    async login(req, res) {
        try {
            const authHeader = req.headers.authorization;
            console.log('🔑 Header Authorization:', authHeader);

            if (!authHeader || !authHeader.startsWith('Basic ')) {
                console.log('❌ Sem header de autenticação ou formato inválido');
                return res.status(401).json({ error: 'Token de autenticação necessário' });
            }

            const token = authHeader.substring(6);
            const decoded = Buffer.from(token, 'base64').toString('utf-8');
            const [username, password] = decoded.split(':');

            console.log('📝 Username:', username, 'Password:', password);

            if (!username || !password) {
                console.log('❌ Username ou password vazios');
                return res.status(401).json({ error: 'Token inválido' });
            }

            const user = await prisma.user.findUnique({
                where: { username }
            });

            console.log('👤 Usuário encontrado:', user?.username, 'Senha do BD:', user?.password);

            if (!user || user.password !== password) {
                console.log('❌ Usuário não encontrado ou senha incorreta');
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            console.log('✅ Login bem-sucedido para:', username);
            res.status(200).json({
                message: 'OK',
                user: {
                    id: user.id,
                    username: user.username,
                    isAdmin: user.isAdmin
                }
            });
        } catch (error) {
            console.error('❌ Erro ao fazer login:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    async register(req, res) {
        try {
            const {username, password} = req.body;

            if (!username || !password) {
                return res.status(400).json({error: 'Username e password são obrigatórios'});
            }

            if (password.length < 4) {
                return res.status(400).json({error: 'Password deve ter no mínimo 4 caracteres'});
            }

            const userCount = await prisma.user.count();
            const isAdmin = userCount === 0;

            const user = await prisma.user.create({
                data: {
                    username,
                    password,
                    isAdmin
                }
            });

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                userId: user.id,
                isAdmin: user.isAdmin
            });
        } catch (error) {
            if (error.code === 'P2002') {
                return res.status(400).json({error: 'Username já existe'});
            }
            console.error('Erro ao registrar usuário:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async getUsers(req, res) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    username: true,
                    isAdmin: true
                }
            });

            res.status(200).json(users);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async getUserById(req, res) {
        try {
            const {id} = req.params;
            const userId = parseInt(id);

            if (isNaN(userId)) {
                return res.status(400).json({error: 'ID inválido'});
            }

            const user = await prisma.user.findUnique({
                where: {id: userId},
                select: {
                    id: true,
                    username: true,
                    isAdmin: true
                }
            });

            if (!user) {
                return res.status(404).json({error: 'Usuário não encontrado'});
            }

            res.status(200).json(user);
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async deleteUser(req, res) {
        try {
            const {id} = req.params;
            const userId = parseInt(id);

            if (isNaN(userId)) {
                return res.status(400).json({error: 'ID inválido'});
            }

            const user = await prisma.user.findUnique({
                where: {id: userId}
            });

            if (!user) {
                return res.status(404).json({error: 'Usuário não encontrado'});
            }

            await prisma.user.delete({
                where: {id: userId}
            });

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    },

    async updateUserAdmin(req, res) {
        try {
            const {id} = req.params;
            const {isAdmin} = req.body;
            const userId = parseInt(id);

            if (isNaN(userId)) {
                return res.status(400).json({error: 'ID inválido'});
            }

            if (typeof isAdmin !== 'boolean') {
                return res.status(400).json({error: 'isAdmin deve ser um boolean'});
            }

            const user = await prisma.user.findUnique({
                where: {id: userId}
            });

            if (!user) {
                return res.status(404).json({error: 'Usuário não encontrado'});
            }

            const updatedUser = await prisma.user.update({
                where: {id: userId},
                data: {isAdmin},
                select: {
                    id: true,
                    username: true,
                    isAdmin: true
                }
            });

            res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    }
};

module.exports = userController;
