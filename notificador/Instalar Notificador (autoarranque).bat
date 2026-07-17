@echo off
chcp 65001 >nul
title Instalar Notificador UAEM (autoarranque)
cd /d "%~dp0"

set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "VBS=%STARTUP%\QuioscoUAEM-Notificador.vbs"

echo Creando el auto-arranque del notificador...
> "%VBS%" echo Set sh = CreateObject("WScript.Shell")
>> "%VBS%" echo sh.CurrentDirectory = "%~dp0"
>> "%VBS%" echo sh.Run """C:\Program Files\nodejs\node.exe"" notificador.js", 0, False

echo.
echo LISTO. El notificador se iniciara automaticamente cada vez que enciendas la PC.
echo Iniciandolo tambien ahora...
start "" wscript "%VBS%"
echo.
echo (Para desactivarlo, borra el archivo:
echo   %VBS% )
echo.
pause
