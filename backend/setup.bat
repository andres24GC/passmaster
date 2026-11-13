@echo off
cd /d %~dp0
echo ========================================
echo PassMaster - Configuracion inicial
echo ========================================
echo.
echo 1) Instalando dependencias...
npm install
if %errorlevel% neq 0 goto error
echo.
echo 2) Creando base de datos y tablas (db:init)...
npm run db:init
if %errorlevel% neq 0 goto error
echo.
echo 3) Insertando usuarios y evento de prueba (seed)...
npm run seed
if %errorlevel% neq 0 goto error
echo.
echo ========================================
echo ¡Listo! Ahora ejecuta: npm run dev
echo ========================================
pause
goto end

:error
echo.
echo ERROR: algo fallo.
echo Revisa que:
echo   - MySQL este corriendo (servicio de Windows o XAMPP).
echo   - backend/.env tenga tus credenciales correctas (DB_USER, DB_PASSWORD).
echo.
pause
:end
