@echo off
echo 🚀 Iniciando o projeto E-commerce...
echo.

echo 📦 Instalando dependências...
call npm run install-deps

echo.
echo 🌱 Populando banco de dados...
cd backend
call npm run db:seed
cd ..

echo.
echo 🎯 Iniciando em modo desenvolvimento...
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo.
echo Pressione Ctrl+C para parar
echo.

call npm run dev 