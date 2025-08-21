# E-commerce Project

Projeto de e-commerce com backend e frontend integrados em um único servidor.

## 🚀 Tecnologias

* **Backend**: Node.js, Express, SQLite
* **Frontend**: React, TypeScript, Tailwind CSS
* **Segurança**: Helmet, CORS, Rate Limiting, JWT
* **Performance**: Compression, Morgan logging
* **Autenticação**: JWT com refresh tokens
* **Validação**: Joi para validação de dados

## 📋 Pré-requisitos

* Node.js (versão 16 ou superior)
* npm ou yarn
* **Não é necessário instalar banco de dados** - o projeto usa SQLite localmente

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [seu-repositorio]
cd ecommerce-project
```

2. Instale as dependências:
```bash
npm run install-deps
```

3. Configure as variáveis de ambiente (opcional):
* Copie o arquivo `env.example` para `.env`
* Ajuste as variáveis conforme necessário
* **O projeto funciona com as configurações padrão**

## 🚀 Executando o projeto

### Início rápido (Windows):
```bash
start.bat
```

### Início rápido (Linux/Mac):
```bash
chmod +x start.sh
./start.sh
```

### Manual:
```bash
# Instalar dependências
npm run install-deps

# Popular banco de dados
cd backend && npm run db:seed && cd ..

# Iniciar desenvolvimento
npm run dev
```

### Ambiente de produção:
```bash
npm run build
npm start
```

## 📦 Estrutura do Projeto

```
ecommerce-project/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── package.json
├── .env.example
├── .gitignore
└── package.json
```

## 🔒 Segurança

O projeto inclui:

* Proteção contra ataques comuns com Helmet
* Rate limiting para prevenir abusos
* CORS configurável
* Sanitização de dados
* Logs de segurança
* Autenticação JWT segura
* Validação de entrada com Joi
* Senhas criptografadas com bcrypt

## 🔍 Monitoramento

* Logs detalhados com Morgan
* Monitoramento de conexão com MongoDB
* Tratamento de erros centralizado
* Middleware de logging personalizado

## 🛍️ Funcionalidades

* Autenticação de usuários (registro/login)
* Gerenciamento de produtos
* Carrinho de compras
* Sistema de pedidos
* Dashboard administrativo
* Interface responsiva
* Upload de imagens
* Sistema de categorias
* Controle de estoque
* Histórico de pedidos

## 📄 Licença

Este projeto está sob a licença MIT.

## 🎯 Credenciais de Demonstração

Após executar o projeto, você pode usar estas credenciais para testar:

* **👑 Admin**: admin@ecommerce.com / admin123
* **👤 Cliente**: customer@ecommerce.com / customer123

## 🚀 Próximos Passos

1. Execute o projeto usando os scripts fornecidos
2. Acesse http://localhost:3000 no seu navegador
3. Teste as funcionalidades com as credenciais de demonstração
4. Explore o dashboard administrativo em /admin
5. Personalize conforme suas necessidades # ecommerce
