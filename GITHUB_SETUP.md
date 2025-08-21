# 🚀 Configuração do GitHub para o Projeto E-commerce

## 📋 Passos para subir o projeto para o GitHub

### 1. **Criar Repositório no GitHub**
1. Acesse: https://github.com
2. Clique em **"New repository"** (ou +)
3. Preencha:
   - **Repository name**: `ecommerce-project`
   - **Description**: `Complete E-commerce platform with React, Node.js, and SQLite`
   - **Visibility**: Public ou Private (sua escolha)
   - **NÃO** marque "Initialize with README" (já temos um)
4. Clique em **"Create repository"**

### 2. **Conectar o Repositório Local ao GitHub**
Execute estes comandos no terminal (substitua `SEU_USERNAME` pelo seu nome de usuário do GitHub):

```bash
# Adicionar o repositório remoto
git remote add origin https://github.com/SEU_USERNAME/ecommerce-project.git

# Verificar se foi adicionado corretamente
git remote -v

# Fazer push do código para o GitHub
git push -u origin main
```

### 3. **Alternativa com SSH (Recomendado)**
Se você tem SSH configurado:

```bash
# Adicionar o repositório remoto via SSH
git remote add origin git@github.com:SEU_USERNAME/ecommerce-project.git

# Fazer push
git push -u origin main
```

### 4. **Se der erro de autenticação**
No Windows, você pode usar:

```bash
# Configurar credenciais (será solicitado username e personal access token)
git config --global credential.helper manager-core
git push -u origin main
```

### 5. **Personal Access Token (se necessário)**
Se o GitHub solicitar um Personal Access Token:

1. Vá para GitHub → Settings → Developer settings → Personal access tokens
2. Clique em "Generate new token"
3. Selecione as permissões necessárias (repo, workflow)
4. Use este token como senha quando solicitado

## ✅ Estrutura do Repositório no GitHub

Após o push, seu repositório terá:

```
ecommerce-project/
├── 📁 backend/           # API Node.js + Express + SQLite
├── 📁 frontend/          # React + TypeScript + Tailwind
├── 📄 README.md          # Documentação principal
├── 📄 INSTRUCOES.md      # Instruções de uso
├── 📄 package.json       # Scripts principais
├── 📄 .gitignore         # Arquivos ignorados
├── 📄 env.example        # Exemplo de variáveis
└── 🚀 Scripts de start
```

## 🔄 Comandos Git Úteis para o Futuro

```bash
# Verificar status
git status

# Adicionar mudanças
git add .

# Fazer commit
git commit -m "Descrição das mudanças"

# Enviar para GitHub
git push

# Puxar mudanças do GitHub
git pull

# Ver histórico
git log --oneline
```

## 🏷️ Criando Releases

Para criar uma release no GitHub:

1. Vá para o repositório no GitHub
2. Clique em **"Releases"**
3. Clique em **"Create a new release"**
4. Tag: `v1.0.0`
5. Title: `E-commerce Platform v1.0.0`
6. Descreva as funcionalidades
7. Clique em **"Publish release"**

## 📝 Exemplo de .env para outros desenvolvedores

Lembre-se de que o arquivo `.env` não é versionado (está no .gitignore). 
Outros desenvolvedores devem copiar `env.example` para `.env` e configurar suas próprias variáveis.

## 🎯 Próximos Passos

1. **Criar repositório no GitHub**
2. **Executar comandos para conectar**
3. **Verificar se o código subiu corretamente**
4. **Configurar GitHub Pages ou Deploy (opcional)**
5. **Compartilhar o link do repositório**

---

**💡 Dica**: Mantenha commits pequenos e com mensagens descritivas para um histórico limpo! 