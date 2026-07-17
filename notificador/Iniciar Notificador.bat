@echo off
chcp 65001 >nul
title Notificador UAEM
cd /d "%~dp0"
echo Iniciando el notificador de escritorio...
echo (Muestra avisos de Windows cuando llega una pregunta nueva de tu area)
echo Deja esta ventana abierta, o usa "Instalar Notificador (autoarranque).bat".
echo.
"C:\Program Files\nodejs\node.exe" notificador.js
echo.
echo El notificador se detuvo. Presiona una tecla para cerrar.
pause >nul
