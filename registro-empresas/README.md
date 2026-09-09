# Registro de empresas · Gestoría Campalans

Aplicación web sencilla para consultar el listado de empresas potenciales,
marcarlas como contactadas y guardar todo permanentemente en Supabase.

No es un CRM: solo tabla, búsqueda, filtros, alta manual, importación /
exportación de Excel y un botón para marcar "Contactada".

## Antes de nada: configura Supabase

Sigue el documento [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md), paso a paso.
Necesitas hacerlo una sola vez. Sin ese paso la aplicación no arranca.

## Ejecutar la aplicación en tu ordenador

Requisitos: tener instalado [Node.js](https://nodejs.org) (versión 18 o
superior).

1. Abre una terminal dentro de la carpeta `registro-empresas`.
2. Instala las dependencias (solo la primera vez):
   ```bash
   npm install
   ```
3. Copia el archivo `.env.example` y renómbralo a `.env.local`. Rellena
   los dos valores con los datos de tu proyecto de Supabase (ver
   `SUPABASE_SETUP.md`, paso "Conectar la aplicación").
4. Arranca la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
5. Abre en el navegador la dirección que aparezca en la terminal
   (normalmente `http://localhost:5173`).
6. Inicia sesión con el email y la contraseña del único usuario que hayas
   creado en Supabase.

## Publicar la aplicación en internet (para usarla desde cualquier sitio)

La forma más sencilla, sin necesidad de servidor propio, es
[Vercel](https://vercel.com) (tiene un plan gratuito suficiente para este
uso):

1. Sube este proyecto a un repositorio de GitHub (o usa el que ya tengas).
2. Entra en [vercel.com](https://vercel.com) e inicia sesión con tu cuenta
   de GitHub.
3. Pulsa "Add New… → Project" y selecciona este repositorio.
4. En "Root Directory" indica `registro-empresas` (la carpeta de la
   aplicación dentro del repositorio).
5. En "Environment Variables" añade las dos mismas variables que pusiste
   en `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Pulsa "Deploy". En un par de minutos tendrás una URL pública
   (`https://tu-proyecto.vercel.app`) para acceder a la aplicación desde
   cualquier ordenador.
7. Cada vez que quieras actualizar la aplicación, vuelve a subir los
   cambios al repositorio de GitHub: Vercel la volverá a publicar sola.

Alternativas equivalentes: [Netlify](https://netlify.com) o
[Cloudflare Pages](https://pages.cloudflare.com), con pasos casi idénticos
(carpeta raíz `registro-empresas`, comando de build `npm run build`,
carpeta de salida `dist`, mismas variables de entorno).

## Qué hace la aplicación

- **Inicio de sesión**: un único usuario, creado manualmente en Supabase.
  No hay registro público.
- **Resumen superior**: total de empresas, no contactadas y contactadas.
- **Buscador**: por razón social, municipio, email o teléfono.
- **Filtros**: por tamaño de empresa y por estado (contactada / no
  contactada).
- **Agrupación por tamaño**: 1-10, 11-50, 51-200, 201-500, 501-1.000, más
  de 1.000 y "no encontrado".
- **Marcar como contactada**: guarda la fecha de hoy automáticamente; la
  fecha se puede modificar después desde "Editar".
- **Edición**: cualquier dato de la empresa se puede editar y se guarda
  al momento en Supabase, con una confirmación visual ("Guardado ✓").
- **Alta manual** de nuevas empresas.
- **Importar Excel**: mismas columnas que el listado original. Detecta
  duplicados comparando la razón social normalizada y muestra cuántas
  empresas se importaron y cuántas se descartaron.
- **Exportar a Excel**: descarga una copia de seguridad completa y
  actualizada en cualquier momento.

## Seguridad

- La aplicación solo usa la clave **anon public** de Supabase (segura para
  el navegador). La clave `service_role` nunca se usa aquí.
- Las políticas de seguridad (Row Level Security) de la base de datos
  están configuradas para que **solo un usuario autenticado** pueda leer o
  modificar datos. Sin iniciar sesión no se puede ver ni cambiar nada.
- No existe pantalla de registro: el único usuario se crea a mano desde el
  panel de Supabase (ver `SUPABASE_SETUP.md`).

## Estructura del proyecto

```
registro-empresas/
├── src/
│   ├── components/       Pantallas y piezas de la interfaz
│   ├── lib/               Conexión a Supabase, importación/exportación Excel, utilidades
│   ├── types.ts           Tipos de datos (empresa, tamaños, estado)
│   └── styles.css         Estilos (blanco y azul)
├── supabase/
│   ├── schema.sql          Crea la tabla y las políticas de seguridad
│   └── seed_datos_iniciales.sql   Carga las 100 empresas del Excel original
├── .env.example            Plantilla de variables de entorno
└── README.md
```
