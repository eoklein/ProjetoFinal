Instalação e Uso

git clone https://github.com/senkoski/biblioteca.git

cd biblioteca

npm install

npx prisma generate

npx prisma migrate dev --name init

node prisma/seed.js

npm run dev

Credenciais

Admin: admin / 1234
User: user / 1234

Rotas

POST /auth/register

GET /books

GET /books/:id

POST /books/:id/borrow

POST /books/:id/return

POST /books (admin)

PATCH /books/:id (admin)

DELETE /books/:id (admin)

GET /users (admin)

GET /users/:id (admin)

DELETE /users/:id (admin)

PATCH /users/:id/admin (admin)

GET /categories

GET /categories/:id

POST /categories (admin)

PUT /categories/:id (admin)

DELETE /categories/:id (admin)

GET /contas

GET /contas/:id

POST /contas (admin)

PUT /contas/:id (admin)

DELETE /contas/:id (admin)

GET /lancamentos

GET /lancamentos/:id

POST /lancamentos

POST /lancamentos/parcelado (criar parcelamento automático)

PUT /lancamentos/:id

DELETE /lancamentos/:id

Headers

Authorization: Basic YWRtaW46MTIzNA== #admin

Authorization: Basic dXNlcjoxMjM0  #usuario normal

Content-Type: application/json

## Exemplos de Uso - Lançamentos

### Criar Lançamento
```json
POST /lancamentos
{
  "descricao": "Salário",
  "valor": 5000.00,
  "data": "2024-11-01T00:00:00.000Z",
  "tipo": "RECEITA"
}
```

### Atualizar Lançamento
```json
PUT /lancamentos/1
{
  "descricao": "Salário Atualizado",
  "valor": 5500.00,
  "data": "2024-11-01T00:00:00.000Z",
  "tipo": "RECEITA"
}
```

### Listar Lançamentos
```
GET /lancamentos
```

### Buscar Lançamento por ID
```
GET /lancamentos/1
```

### Deletar Lançamento
```
DELETE /lancamentos/1
```

