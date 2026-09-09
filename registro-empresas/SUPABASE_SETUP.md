# Configurar Supabase para el Registro de empresas de Gestoría Campalans

Esta guía está pensada para alguien sin conocimientos técnicos. Sigue los
pasos en orden. No hace falta hacerlo todo de una vez.

## Paso 1 · Crear la cuenta y el proyecto en Supabase

1. Entra en [supabase.com](https://supabase.com) y crea una cuenta gratuita
   (puedes usar tu cuenta de Google o de GitHub).
2. Pulsa "New project".
3. Ponle un nombre, por ejemplo `campalans-registro-empresas`.
4. Elige una contraseña segura para la base de datos y guárdala en un
   lugar seguro (no la necesitarás en el día a día, pero conviene
   guardarla).
5. Elige la región más cercana (por ejemplo, una región de Europa).
6. Pulsa "Create new project" y espera un par de minutos a que se cree.

## Paso 2 · Crear la tabla y la seguridad (ejecutar el SQL)

1. Dentro de tu proyecto de Supabase, en el menú de la izquierda, entra en
   **SQL Editor**.
2. Pulsa "New query".
3. Abre el archivo `supabase/schema.sql` de este proyecto, copia **todo**
   su contenido y pégalo en el editor de Supabase.
4. Pulsa "Run" (o "RUN" en la esquina inferior derecha).
5. Debe aparecer un mensaje de éxito ("Success. No rows returned").

Esto crea la tabla `empresas` y las reglas de seguridad: solo un usuario
que haya iniciado sesión podrá ver o modificar los datos.

## Paso 3 · Crear el único usuario autorizado

1. En el menú de la izquierda, entra en **Authentication → Users**.
2. Pulsa "Add user" → "Create new user".
3. Escribe el email y la contraseña que quieras usar para entrar en la
   aplicación (por ejemplo, tu email de Gestoría Campalans).
4. Marca la casilla "Auto Confirm User" si aparece (así no hace falta
   confirmar el email).
5. Pulsa "Create user".

Ese email y contraseña serán los que uses para iniciar sesión en la
aplicación. No hace falta crear ningún usuario más: la aplicación no
tiene pantalla de registro.

## Paso 4 · Cargar las 100 empresas del Excel original

1. Vuelve a **SQL Editor → New query**.
2. Abre el archivo `supabase/seed_datos_iniciales.sql` de este proyecto,
   copia todo su contenido y pégalo en el editor.
3. Pulsa "Run".
4. Debe indicar que se han insertado 100 filas (o menos, si alguna ya
   existiera).

Todas las empresas se cargan con estado "No contactado", sin fecha ni
observaciones, tal y como se pidió.

## Paso 5 · Conectar la aplicación con tu proyecto

1. En Supabase, entra en **Settings → API** (o **Project Settings → API**).
2. Copia el valor de **Project URL** (algo como
   `https://abcdefghijk.supabase.co`).
3. Copia el valor de **anon public** (una clave larga de letras y
   números). **No copies la clave "service_role"**, esa nunca se usa en
   la aplicación.
4. En la carpeta `registro-empresas` de este proyecto, copia el archivo
   `.env.example` y renómbralo a `.env.local`.
5. Abre `.env.local` con un editor de texto sencillo y pega los dos
   valores:
   ```
   VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
   VITE_SUPABASE_ANON_KEY=la-clave-anon-public-que-has-copiado
   ```
6. Guarda el archivo.

Con esto la aplicación ya puede conectarse a tu base de datos. Sigue las
instrucciones de `README.md` para arrancarla en tu ordenador o publicarla
en internet.

## Preguntas frecuentes

**¿Puedo cambiar la contraseña del usuario más adelante?**
Sí. En Supabase, ve a **Authentication → Users**, pulsa sobre el usuario y
elige la opción para restablecer o cambiar su contraseña.

**¿Puedo crear un segundo usuario en el futuro?**
Si en algún momento quieres dar acceso a otra persona, puedes crear otro
usuario igual que en el Paso 3: las políticas de seguridad ya permiten a
cualquier usuario autenticado (no solo al primero) usar la aplicación.

**¿Dónde se guardan realmente los datos?**
En la base de datos de tu proyecto de Supabase (no en tu ordenador ni en
el navegador), así que los cambios se mantienen aunque cierres sesión,
recargues la página o entres otro día desde otro ordenador.

**He perdido el archivo `.env.local`, ¿es grave?**
No. Solo contiene la URL de tu proyecto y la clave pública. Puedes volver
a copiarlos desde **Settings → API** en Supabase cuando quieras.
