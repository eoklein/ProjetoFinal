const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDb() {
  try {
    const count = await prisma.tipoPatrimonio.count();
    console.log('Total de TipoPatrimonio:', count);
    
    const tipos = await prisma.tipoPatrimonio.findMany();
    console.log('Tipos encontrados:');
    console.log(JSON.stringify(tipos, null, 2));
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
