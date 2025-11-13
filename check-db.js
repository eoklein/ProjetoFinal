const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, './projeto-base-backend-main/prisma/dev.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar:', err);
    return;
  }
  
  console.log('Conectado ao banco de dados');
  
  // Contar tipos de patrimônio
  db.all('SELECT COUNT(*) as count FROM TipoPatrimonio', (err, rows) => {
    if (err) {
      console.error('Erro:', err);
    } else {
      console.log('Total de TipoPatrimonio:', rows[0].count);
    }
    
    // Listar todos os tipos
    db.all('SELECT id, nome, userId FROM TipoPatrimonio', (err, rows) => {
      if (err) {
        console.error('Erro:', err);
      } else {
        console.log('Tipos de Patrimônio:');
        console.log(rows);
      }
      
      db.close();
    });
  });
});
