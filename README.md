# Homologaciones Campalans — Sitio web corporativo

Sitio web informativo para Homologaciones Campalans (importación, homologación y
matriculación de vehículos). Construido con HTML5 semántico, CSS moderno y
JavaScript vanilla, sin frameworks ni dependencias de build.

## Archivos del proyecto

- `index.html` — estructura y contenido de la página.
- `styles.css` — estilos, paleta de color y sistema responsive.
- `script.js` — menú móvil, validación del formulario de contacto y año del copyright.
- `assets/` — recursos gráficos (ver estado más abajo).
- `README.md` — este documento.

## Cómo ejecutar el sitio en local

No requiere instalación ni dependencias. Basta con servir la carpeta con
cualquier servidor estático, por ejemplo:

```bash
cd Fotos-Coches
python3 -m http.server 8000
```

Y abrir `http://localhost:8000` en el navegador. También puede abrirse
`index.html` directamente con doble clic, aunque se recomienda un servidor
local para que las rutas de `assets/` funcionen igual que en producción.

## Estado del contenido — IMPORTANTE

Este primer build reproduce fielmente la estructura, el ritmo de secciones,
la paleta de color y la tipografía corporativa acordadas (segundo recuadro
de la fila superior del mockup de referencia), pero **el contenido de texto
específico del negocio todavía no se ha recibido** (PDF con servicios, las 4
fases del servicio, motivos para elegir Campalans, datos de contacto, años
de experiencia y países de origen de los vehículos).

Todo ese contenido está marcado explícitamente en `index.html` con el texto
`[PENDIENTE: ...]` para que sea fácil de localizar y sustituir. Buscar la
cadena `PENDIENTE` en el archivo para encontrar cada punto exacto.

Puntos pendientes de contenido:

- Titular y párrafo del hero.
- Texto de introducción ("Así traemos tu coche a España").
- Título, descripción (y precio si aplica) de las **4 fases reales** del
  servicio, en el mismo orden que el PDF. *(La maqueta de referencia mostraba
  6 columnas; el encargo especifica que deben ser 4 fases reales — no
  inventar dos fases adicionales.)*
- Lista real de servicios ofrecidos.
- Texto ampliado de la consultoría personalizada y sus 4 puntos destacados.
- Los 4 motivos reales de "Por qué Campalans".
- Años de experiencia y texto sobre la trayectoria de la empresa.
- Países/mercados de origen de los vehículos (ejemplo orientativo en el
  código: Emiratos Árabes Unidos, Estados Unidos, Canadá — **confirmar con
  el PDF oficial antes de publicar**, no está confirmado todavía).
- Email y teléfono/WhatsApp oficiales (aparecen repetidos en la sección de
  contacto y en el pie de página).
- Textos legales de "Aviso legal" y "Política de privacidad" (los enlaces
  existen pero no se ha creado contenido legal, ya que no se ha suministrado
  ningún texto legal real).

## Estado de las imágenes — IMPORTANTE

No se han recibido fotografías originales de la empresa (imagen principal del
hero, imagen de transporte/logística, imagen de la sección final de
contacto). En su lugar se han usado **bloques de color de marcador de
posición** (clase CSS `.placeholder-block`), con una etiqueta visible
indicando qué imagen debe ir ahí. No se ha descargado ninguna foto de stock.

Para sustituirlos:

1. Colocar la imagen real optimizada (por ejemplo, formato `.webp` o `.jpg`)
   dentro de `assets/`.
2. En `index.html`, sustituir el `<div class="... placeholder-block">`
   correspondiente por una etiqueta `<img>` con `src`, `alt` descriptivo,
   `width`/`height` explícitos y `loading="lazy"` si está bajo el pliegue.

## Estado del logo — IMPORTANTE

El logo oficial de Homologaciones Campalans que se compartió en la
conversación no pudo guardarse como archivo en este entorno (las imágenes
pegadas en el chat no quedan disponibles como archivo en disco). Por eso se
ha creado un **marcador de posición genérico** (`assets/logo-placeholder-light.svg`
para fondos claros y `assets/logo-placeholder-dark.svg` para fondos oscuros),
que **no reproduce ni reinterpreta el diseño real del logo**: es solo una
caja con borde discontinuo y el texto "LOGO CAMPALANS (pendiente de
sustituir)".

Para sustituirlo:

1. Añadir el archivo oficial del logo (idealmente `.svg` o `.png` con fondo
   transparente) a `assets/`, por ejemplo `assets/logo.png` y, si existe una
   versión adaptada para fondo oscuro, `assets/logo-dark.png`.
2. En `index.html`, actualizar los dos `<img>` (cabecera y pie de página)
   para que apunten al archivo real, ajustando `width`/`height` a las
   proporciones reales del logo.
3. No recolorear, recortar, distorsionar ni aplicar efectos al logo oficial.

## Favicon

Se ha añadido un favicon provisional neutro (`assets/favicon.svg`, una "C"
sobre fondo navy) porque no se ha suministrado un icono oficial. Sustituir
por el icono de marca real cuando esté disponible.

## Formulario de contacto — configuración del envío de correo

El formulario (`#contactForm` en `index.html`, gestionado en `script.js`)
realiza validación completa en el cliente: campos obligatorios, formato de
email, formato de teléfono y aceptación obligatoria de la política de
privacidad, con mensajes de error accesibles (`role="alert"`) junto a cada
campo.

**El envío de correo real todavía no está conectado.** En `script.js` hay
una única variable documentada al principio del archivo:

```js
var CONTACT_FORM_ENDPOINT = '';
```

Mientras esté vacía, el formulario se valida correctamente pero muestra un
aviso indicando que el envío no está conectado a ningún servicio, en lugar
de simular un envío exitoso falso.

Para activar el envío real:

1. Configurar un endpoint que reciba `POST` con los campos del formulario
   (por ejemplo, un servicio propio, una función serverless, o un proveedor
   de formularios transaccionales).
2. Sustituir el valor de `CONTACT_FORM_ENDPOINT` por la URL de ese servicio.
3. Verificar que el endpoint devuelve una respuesta HTTP correcta (`ok`)
   para que el mensaje de confirmación se muestre al usuario.

## Paleta de color

Definida como variables CSS en `:root` (`styles.css`):

| Variable | Valor | Uso |
|---|---|---|
| `--color-navy-900` | `#001622` | Navy principal (fondos oscuros, texto) |
| `--color-navy-800` | `#032A3F` | Navy secundaria (tarjetas sobre fondo oscuro) |
| `--color-grey-700` | `#35414F` | Gris oscuro (texto secundario) |
| `--color-cyan` | `#00DDFF` | Acento (botones, números de fase, detalles) |
| `--color-white` | `#FFFFFF` | Blanco |

No se ha usado ningún color fuera de esta paleta (ni verde, lima, naranja ni
morado), tal y como se solicitó.

## Tipografía

Montserrat, cargada desde Google Fonts (pesos 400, 500, 600 y 700). Si se
dispone del archivo de fuente oficial de la empresa, sustituir el `<link>`
de Google Fonts en `index.html` por `@font-face` con el archivo local.

## Accesibilidad y calidad

- Un único `<h1>` (titular del hero).
- Enlace "Saltar al contenido principal" para usuarios de teclado.
- Estados de foco visibles (`:focus-visible`) con el color de acento.
- `prefers-reduced-motion` respetado (desactiva transiciones/scroll suave).
- Formulario con etiquetas asociadas y errores anunciados con `role="alert"`.
- Sin carruseles, sin chatbots, sin animaciones innecesarias, sin emojis.

## Pendiente antes de publicar

1. Sustituir todos los textos `[PENDIENTE: ...]` con el contenido real del
   PDF oficial.
2. Sustituir los bloques de imagen de marcador de posición por las
   fotografías originales.
3. Sustituir los SVG de marcador de posición del logo por el archivo oficial.
4. Configurar `CONTACT_FORM_ENDPOINT` en `script.js` para que el formulario
   envíe correos reales.
5. Redactar y enlazar los textos legales de "Aviso legal" y "Política de
   privacidad".
