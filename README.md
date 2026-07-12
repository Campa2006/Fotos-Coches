# Homologaciones Campalans — Sitio web corporativo

Sitio web informativo para Homologaciones Campalans (importación, homologación y
matriculación de vehículos). Construido con HTML5 semántico, CSS moderno y
JavaScript vanilla, sin frameworks ni dependencias de build.

El diseño reproduce con fidelidad tres capturas de referencia facilitadas por
el cliente (cabecera + hero + fases · consultoría + experiencia + origen ·
bloque final de contacto), con el logotipo oficial sustituyendo al logo que
aparecía en esas capturas.

## Archivos del proyecto

Todo el sitio publicable vive dentro de `/docs`, que es la carpeta que
GitHub Pages requiere para publicar desde la rama principal:

- `docs/index.html` — estructura y contenido de la página.
- `docs/styles.css` — estilos, paleta de color y sistema responsive.
- `docs/script.js` — menú móvil y validación del formulario de contacto.
- `docs/assets/` — logo oficial y fotografías reales (ver procedencia más abajo).
- `README.md` — este documento.

Todas las rutas dentro de `docs/index.html` son relativas (`styles.css`,
`script.js`, `assets/...`), así que el sitio funciona igual sirviéndolo desde
la raíz del repositorio o desde `/docs`.

## Publicar con GitHub Pages

En la configuración del repositorio (Settings → Pages), selecciona la rama
correspondiente y la carpeta **`/docs`** como origen. GitHub Pages servirá
`docs/index.html` como página principal.

## Cómo ejecutar el sitio en local

```bash
cd Fotos-Coches/docs
python3 -m http.server 8000
```

Y abrir `http://localhost:8000` en el navegador.

## Estructura de la página

Únicamente las secciones que aparecen en las capturas de referencia, en este
orden, sin footer corporativo ni secciones adicionales:

1. Cabecera (logo + navegación + botón "Contacto").
2. Hero principal (titular, texto, CTA, vehículo a la derecha).
3. "Así traemos tu coche a España".
4. Las 6 fases del servicio, en una fila con separadores verticales.
5. Consultoría 1 a 1 (texto + 4 tarjetas).
6. Bloque de experiencia (gráfico en C + texto).
7. "También traemos coches de USA, Canadá y Europa".
8. Fotografía horizontal de transporte de vehículos, a todo el ancho.
9. Bloque final: fotografía + formulario de contacto.

## Procedencia del contenido

Los textos de todas las secciones (titulares, párrafos, las 6 fases, los 4
puntos de la consultoría, los textos de experiencia y origen, y los campos
del formulario) están tomados literalmente de las tres capturas de
referencia que el cliente adjuntó para este rediseño, que sí eran legibles a
resolución completa. No se ha inventado ni reinterpretado ningún contenido.

## Datos de contacto

Email y teléfono/WhatsApp oficiales, confirmados por el cliente, enlazados
como `mailto:` y `tel:` bajo el formulario de contacto:

- Email: `homologaciones@gestoriacampalans.com`
- Teléfono / WhatsApp: `931 27 99 03`

## Logo e imágenes — procedencia real

- `docs/assets/logo-campalans.png` — logotipo oficial completo, usado tal
  cual, sin recolorear, recortar ni aplicar efectos. Sobre fondo oscuro
  (cabecera) se apoya sobre una placa blanca (`.site-header__logo`) para que
  se lea correctamente, sin modificar el archivo del logo en sí.
- `docs/assets/favicon-campalans.png` — recorte cuadrado del icono "C" del
  propio logo oficial (mismo archivo, sin redibujar).
- `docs/assets/hero-vehiculo-importado.jpg` — vehículo y gráfica de
  matrícula/importación del hero.
- `docs/assets/transporte-vehiculos.jpg` — fotografía de vehículos sobre un
  camión de transporte.
- `docs/assets/conduccion-campalans.jpg` — fotografía de un conductor al
  volante, usada en escala de grises (`filter: grayscale(1)`) en el bloque
  final de contacto.
- `docs/assets/experiencia-grafico-c.jpg` — elemento gráfico en forma de "C"
  del bloque de experiencia, recortado de la captura de referencia.

**Aviso de calidad de imagen**: estas fotografías proceden de capturas y
maquetas de diseño, no de archivos fotográficos originales a resolución
completa. Se han recortado y escalado lo mejor posible, pero su resolución
nativa es limitada. Si el cliente dispone en algún momento de las
fotografías originales a resolución completa, deben sustituir a estos
recortes para una calidad óptima en pantallas grandes.

## Paleta de color

Variables CSS en `:root` (`docs/styles.css`):

| Variable | Valor | Uso |
|---|---|---|
| `--color-navy-900` | `#001622` | Navy principal (cabecera, hero, fases) |
| `--color-navy-800` | `#032A3F` | Navy secundaria (bordes, detalles) |
| `--color-grey-700` | `#35414F` | Gris azulado (consultoría, panel de contacto) |
| `--color-cyan` | `#00DDFF` | Acento (botones, números de fase) |
| `--color-white` | `#FFFFFF` | Blanco |

El fondo muy claro del bloque de experiencia es una variación de opacidad de
`--color-navy-800` (`--color-navy-800-a04`), no un color nuevo. No se ha
usado ningún color fuera de esta paleta.

## Tipografía

Montserrat, cargada desde Google Fonts (pesos 400, 500, 600 y 700).

## Formulario de contacto — configuración del envío de correo

El formulario (`#contactForm` en `docs/index.html`, gestionado en
`docs/script.js`) tiene los campos Nombre, Correo electrónico, Número de
teléfono, Mensaje y la casilla de aceptación del aviso legal, con validación
en el cliente y mensajes de error accesibles (`role="alert"`).

**El envío de correo real todavía no está conectado.** En `docs/script.js`:

```js
var CONTACT_FORM_ENDPOINT = '';
```

Mientras esté vacía, el formulario se valida correctamente pero avisa de que
el envío no está conectado a ningún servicio. Para activarlo, configura un
endpoint que reciba `POST` con los campos del formulario y sustituye el
valor de `CONTACT_FORM_ENDPOINT` por su URL.

## Accesibilidad y calidad

- Un único `<h1>` (titular del hero).
- Enlace "Saltar al contenido principal" para usuarios de teclado.
- Estados de foco visibles (`:focus-visible`) con el color de acento.
- `prefers-reduced-motion` respetado.
- Formulario con etiquetas asociadas y errores anunciados con `role="alert"`.
- Sin carruseles, sin chatbots, sin animaciones innecesarias, sin emojis.

## Pendiente antes de publicar

1. Configurar `CONTACT_FORM_ENDPOINT` en `docs/script.js` para el envío real
   de correos.
2. Redactar y enlazar un texto legal real para el enlace "aviso legal" del
   formulario (no se ha recibido ningún texto legal).
3. Si aparecen las fotografías originales a resolución completa, sustituir
   los recortes de `docs/assets/` para mejorar la nitidez en pantallas
   grandes.
