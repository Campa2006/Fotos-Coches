@echo off
REM Arranca la aplicacion y abre el navegador (usar cada vez que se quiera usar)
cd /d "%~dp0"
call venv\Scripts\activate.bat
python run.py
pause
