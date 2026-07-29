# Analizador de Albaranes — Gestoría Campalans

Aplicación local (sin conexión a internet ni a A9) para subir los albaranes PDF
de A9 Factura, extraer automáticamente los honorarios facturados y consultar
rankings de clientes y trámites por mes y año. Los datos se guardan de forma
permanente en una base de datos SQLite en tu propio ordenador.

## Instalación en Windows (solo la primera vez)

1. Instala **Python 3.10 o superior** si no lo tienes: https://www.python.org/downloads/
   - Muy importante: en el instalador, marca la casilla **"Add Python to PATH"**
     antes de pulsar "Install Now".
2. Descarga o copia la carpeta `albaranes-analyzer` completa a tu ordenador.
3. Haz doble clic en **`instalar.bat`**.
   - Se creará automáticamente un entorno virtual y se instalarán las
     librerías necesarias (FastAPI, PyMuPDF, etc.). Puede tardar 1-2 minutos.

## Uso diario

1. Haz doble clic en **`iniciar.bat`**.
2. Se abrirá una ventana negra (no la cierres mientras uses la aplicación) y
   el navegador se abrirá automáticamente en `http://127.0.0.1:8000`.
   Si no se abre solo, entra tú mismo a esa dirección con cualquier navegador.
3. Arrastra uno o varios PDF de albaranes a la zona indicada, o pulsa
   "Elegir archivos".
4. Consulta los rankings de **Clientes** y **Trámites**, filtrando por mes y
   año, y revisa el listado de **Albaranes importados**.
5. Para cerrar la aplicación, cierra la ventana negra (la ventana de comandos).

Tus datos quedan guardados en `data\albaranes.db` aunque cierres la aplicación
o apagues el ordenador. Se recomienda hacer copias de seguridad periódicas de
ese archivo.

## Qué hace la aplicación

- Extrae de cada albarán PDF: número, fecha de operación, cliente, NIF del
  cliente, trámite(s) e importe de honorarios (antes de IVA).
- Solo contabiliza las líneas cuyo concepto empieza por "Honorarios." y usa
  la columna "Importe (€)" (nunca el "Total (€)", el IVA, las tasas DGT, las
  tasas del Colegio ni los suplidos).
- Identifica siempre a CAMPALANS ASSESSORAMENT I GESTIÓ SL como emisor, nunca
  como cliente, y nunca usa el nombre que aparece junto a "Vehículo" como
  cliente.
- Evita duplicados: si subes el mismo albarán dos veces (mismo número de
  albarán o mismo archivo), se marca como "Duplicado" y no se vuelve a sumar.
- Si no puede identificar con seguridad el número, la fecha, el cliente o los
  honorarios, el albarán se guarda con el estado "Necesita revisión" y **no**
  se suma a los totales hasta que lo corrijas manualmente desde la pestaña
  "Albaranes importados" (botón "Corregir").
- Si el PDF no se puede leer en absoluto, se marca como "Error de lectura".

## Estructura del proyecto

```
albaranes-analyzer/
  app/
    main.py       API (FastAPI)
    database.py   Esquema y conexión SQLite
    parser.py     Extracción de texto y reglas de negocio del PDF
    service.py    Importación, deduplicación, rankings y CRUD
  static/         Interfaz web (HTML/CSS/JS)
  data/           Base de datos SQLite (se crea automáticamente)
  uploads/        (reservado para uso futuro)
  samples/        PDF de ejemplo usado para validar el analizador
  run.py          Arranca el servidor y abre el navegador
  requirements.txt
  instalar.bat / iniciar.bat   Scripts para Windows
```

## Solución de problemas

- **"No se ha encontrado Python"**: reinstala Python marcando "Add Python to
  PATH", o reinicia el ordenador tras instalarlo.
- **El navegador no se abre solo**: abre cualquier navegador y entra a
  `http://127.0.0.1:8000` manualmente mientras la ventana negra siga abierta.
- **Un PDF sale como "Necesita revisión"**: ábrelo con "Consultar" para ver
  qué dato no se detectó y corrígelo con el botón "Corregir".
- **Quiero borrar todos los datos y empezar de cero**: cierra la aplicación y
  borra el archivo `data\albaranes.db`.

## Notas técnicas

- Backend: Python + FastAPI + SQLite.
- Extracción de PDF: PyMuPDF, adaptada al formato de A9 Factura.
- Frontend: HTML, CSS y JavaScript sin dependencias externas.
- Esta primera versión asume que cada PDF contiene un único albarán (aunque
  tenga varias líneas de honorarios). No hay conexión con A9 ni ninguna API
  externa: todo funciona en local.
