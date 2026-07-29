@echo off
REM Instala la aplicacion (solo hay que ejecutar esto la primera vez)
cd /d "%~dp0"

echo Creando entorno virtual de Python...
python -m venv venv
if errorlevel 1 (
    echo.
    echo ERROR: No se ha encontrado Python. Instala Python desde https://www.python.org/downloads/
    echo Importante: al instalar, marca la casilla "Add Python to PATH".
    pause
    exit /b 1
)

call venv\Scripts\activate.bat

echo Instalando dependencias...
pip install -r requirements.txt

echo.
echo Instalacion completada. Ya puedes ejecutar "iniciar.bat".
pause
