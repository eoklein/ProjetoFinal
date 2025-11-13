const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const userController = {
    async login(req, res) {
        res.status(200).json({
            message: 'OK',
            user: {
                id: req.user.id,
                username: req.user.username,
                isAdmin: req.user.isAdmin
            }
        });
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
