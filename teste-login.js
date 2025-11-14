const http = require('http');

const credentials = Buffer.from('admin:admin').toString('base64');
console.log('Enviando login com credenciais:', credentials);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/auth/login',
  method: 'POST',
  headers: {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
    'Content-Length': 2
  }
};

console.log('Opções:', options);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    console.log('Recebendo chunk:', chunk.toString());
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response completo:', data);
    try {
      console.log('Parsed:', JSON.parse(data));
    } catch (e) {
      console.log('Not JSON:', e.message);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Error ao conectar:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Timeout na requisição');
  process.exit(1);
});

console.log('Escrevendo body...');
req.write('{}');
req.end();

