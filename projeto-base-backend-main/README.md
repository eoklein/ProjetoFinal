# Biblioteca - Backend API

## Instalação Rápida

```bash
cd projeto-base-backend-main
npm install
npm run prisma:setup  # Executa migrações + seed automaticamente
npm start             # Inicia o servidor na porta 3000
```

## 🔐 Credenciais Padrão

Ao executar `npm run prisma:setup`, os seguintes usuários são criados automaticamente:

| Usuário | Senha | Permissão    |
|---------|-------|--------------|
| **admin**   | **1234**  | Administrador |
| **user**    | **1234**  | Usuário Normal |

## 🔑 Autenticação (Basic Auth)

O sistema usa **Basic Auth** para todas as requisições autenticadas.

### Exemplo com cURL:
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Authorization: Basic $(echo -n 'admin:1234' | base64)" \
  -H "Content-Type: application/json"

# Acessar recurso protegido
curl -X GET http://localhost:3000/patrimonios \
  -H "Authorization: Basic $(echo -n 'user:1234' | base64)"
```

### Headers para requisições:
```
Authorization: Basic YWRtaW46MTIzNA==  # admin:1234
Authorization: Basic dXNlcjoxMjM0      # user:1234
Content-Type: application/json
```

## 📚 Rotas da API

### 🔑 Autenticação
- `POST /auth/login` - Fazer login (requer Basic Auth no header)
- `POST /auth/register` - Registrar novo usuário

### 👥 Usuários (admin only)
- `GET /users` - Listar todos os usuários
- `GET /users/:id` - Buscar usuário por ID
- `DELETE /users/:id` - Deletar usuário
- `PATCH /users/:id/admin` - Atualizar status de admin

### 📦 Tipos de Patrimonio
- `GET /tiposPatrimonio` - Listar todos os tipos
- `GET /tiposPatrimonio/:id` - Buscar tipo por ID
- `POST /tiposPatrimonio` - Criar tipo
- `PUT /tiposPatrimonio/:id` - Atualizar tipo
- `DELETE /tiposPatrimonio/:id` - Deletar tipo

### 🏛️ Patrimonios
- `GET /patrimonios` - Listar patrimonios do usuário
- `GET /patrimonios/:id` - Buscar patrimonio por ID
- `POST /patrimonios` - Criar patrimonio
- `PUT /patrimonios/:id` - Atualizar patrimonio
- `DELETE /patrimonios/:id` - Deletar patrimonio ✅ (reseta ID para 1)

### 📊 Estoques/Lançamentos
- `GET /lancamentos` - Listar estoques
- `GET /lancamentos/:id` - Buscar estoque por ID
- `POST /lancamentos` - Criar estoque
- `POST /lancamentos/com-retiradas` - Criar com retiradas parceladas
- `PUT /lancamentos/:id` - Atualizar estoque
- `DELETE /lancamentos/:id` - Deletar estoque ✅ (reseta ID para 1)

## 💡 Exemplos de Uso

### Criar Patrimonio
```bash
curl -X POST http://localhost:3000/patrimonios \
  -H "Authorization: Basic dXNlcjoxMjM0" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Notebook Dell",
    "status": "bom",
    "valor": 3000.00,
    "tipoPatrimonioId": 1
  }'
```

### Listar Patrimonios
```bash
curl -X GET http://localhost:3000/patrimonios \
  -H "Authorization: Basic dXNlcjoxMjM0"
```

### Criar Estoque/Lançamento
```bash
curl -X POST http://localhost:3000/lancamentos \
  -H "Authorization: Basic dXNlcjoxMjM0" \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Entrada de notebook",
    "valor": 3000.00,
    "data": "2024-11-13T00:00:00.000Z",
    "tipo": "RECEITA",
    "patrimonioId": 1,
    "tipoPatrimonioId": 1
  }'
```

### Deletar Patrimonio (reseta ID para 1)
```bash
curl -X DELETE http://localhost:3000/patrimonios/5 \
  -H "Authorization: Basic YWRtaW46MTIzNA=="
```

## ✨ Recursos Principais

- ✅ Autenticação com Basic Auth
- ✅ **ID auto-reset quando tabela é esvaziada**
- ✅ Gerenciamento de patrimonios com tipos
- ✅ Rastreamento de estoques/lançamentos
- ✅ Suporte a lançamentos parcelados
- ✅ Controle de permissões (admin)
- ✅ SQLite com Prisma ORM

## 🗄️ Banco de Dados

**SQLite** (`prisma/dev.db`) com as seguintes tabelas:

- **Users** - Usuários do sistema
- **TipoPatrimonio** - Tipos de patrimônios
- **Patrimonio** - Patrimônios registrados
- **Estoque** - Estoques/Lançamentos

### Migrações
Todas as migrações estão em `prisma/migrations/`. Execute `npm run prisma:setup` para aplicá-las automaticamente.

## 🚀 Scripts Disponíveis

```bash
npm start              # Inicia o servidor
npm run dev            # Mesmo que npm start
npm run prisma:setup   # Executa migrações + seed
npm run prisma:seed    # Apenas popula dados iniciais
npm run prisma:migrate # Cria nova migração
npm run prisma:generate # Regenera Prisma client
```

## 📝 Notas Importantes

1. **ID Reset**: Quando todos os patrimonios/estoques são deletados, o próximo criado terá ID = 1
2. **Basic Auth**: Credenciais são convertidas em base64 no header: `Authorization: Basic <base64(username:password)>`
3. **Tipos Padrão**: Software, Hardware, Serviços, Materiais, Outros (criados automaticamente no seed)
4. **Senha Padrão**: Ambos os usuários padrão usam senha `1234`

## 🐛 Troubleshooting

### Porta 3000 já em uso?
```bash
# Windows - encontrar e matar processo
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Resetar banco de dados?
```bash
rm prisma/dev.db
npm run prisma:setup
```

### Testar API sem autenticação?
```bash
# Será rejeitado com 401 Unauthorized
curl http://localhost:3000/patrimonios
# Retorna: {"error":"Token de autenticação necessário"}
```
