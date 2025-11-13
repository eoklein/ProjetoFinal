const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log(' Iniciando população do banco de dados...');

    let adminUser, normalUser;

    try {
        adminUser = await prisma.user.create({
            data: {username: 'admin', password: '1234', isAdmin: true}
        });
        console.log(' Usuário admin criado');
    } catch (error) {
        if (error.code === 'P2002') {
            console.log('  Usuário admin já existe');
            adminUser = await prisma.user.findUnique({where: {username: 'admin'}});
        }
    }

    try {
        normalUser = await prisma.user.create({
            data: {username: 'user', password: '1234', isAdmin: false}
        });
        console.log(' Usuário user criado');
    } catch (error) {
        if (error.code === 'P2002') {
            console.log('  Usuário user já existe');
            normalUser = await prisma.user.findUnique({where: {username: 'user'}});
        }
    }

    // Criar tipos fixos de patrimonio
    const tiposFixos = ['Software', 'Hardware', 'Serviços', 'Materiais', 'Outros'];
    for (const tipo of tiposFixos) {
        try {
            const existing = await prisma.tipoPatrimonio.findFirst({
                where: { nome: tipo }
            });
            
            if (!existing) {
                await prisma.tipoPatrimonio.create({
                    data: {
                        nome: tipo,
                        userId: adminUser.id
                    }
                });
                console.log(`  Tipo "${tipo}" criado`);
            } else {
                console.log(`  Tipo "${tipo}" já existe`);
            }
        } catch (error) {
            console.error(`  Erro ao criar tipo "${tipo}":`, error.message);
        }
    }
    console.log(' Tipos de patrimonio criados');

    console.log(' Dados iniciais criados com sucesso!');
    console.log('Usuários: admin (senha: 1234) - user (senha: 1234)');
    console.log(`Dados de exemplo criados para o usuário: ${normalUser.username}`);
}

main()
.catch((e) => {
    console.error(' Erro no seed:', e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
});
