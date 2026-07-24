# Homologaciones Campalans — Sitio web corporativo

Sitio web informativo para Homologaciones Campalans (importación, transporte,
aduanas, homologación y matriculación de vehículos, con especialización en
importación desde Dubai). Construido con HTML5 semántico, CSS moderno y
JavaScript vanilla, sin frameworks ni dependencias de build.

El diseño y el contenido reproducen fielmente el sitio de referencia
facilitado por el cliente (una copia offline completa del sitio real en
`desarrollo.rankingonline.com/campalans`, construido en WordPress/Elementor),
manteniendo el nombre de marca **Homologaciones Campalans** con el icono "C"
del logotipo oficial.

## Archivos del proyecto

Todo el sitio publicable vive dentro de `/docs`, que es la carpeta que
GitHub Pages requiere para publicar desde la rama principal:

- `docs/index.html` — estructura y contenido de la página.
- `docs/styles.css` — estilos, paleta de color y sistema responsive.
- `docs/script.js` — menú móvil, efecto hover de las 6 fases y validación
  del formulario de contacto.
- `docs/assets/` — logotipo (icono recortado) y fotografías reales del
  sitio de referencia (ver procedencia más abajo).
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
cd docs
python3 -m http.server 8000
```

Y abrir `http://localhost:8000` en el navegador.

## Estructura de la página

1. Cabecera (logo + navegación + botón "Contacto"), superpuesta y
   transparente sobre el hero.
2. Hero principal (titular, texto, CTA "Quiero importar mi coche").
3. "Así traemos tu coche a España".
4. Las 6 fases del servicio, en una fila con efecto interactivo al pasar
   el ratón (se expande la columna activa; solo en escritorio).
5. Consultoría 1 a 1 (texto + 4 tarjetas con icono).
6. Bloque "Por qué Campalans" / experiencia (gráfico en C + texto,
   +10 años de experiencia).
7. "También traemos coches de USA, Canadá y Europa".
8. Banda fotográfica horizontal de transporte de vehículos, a todo el ancho.
9. Bloque final de contacto: fotografía + formulario.
10. Pie de página con logo, descripción, navegación y datos de contacto.

## Datos de contacto

Dirección, teléfono/WhatsApp y email oficiales, enlazados como `tel:` y
`mailto:` en el pie de página y bajo el formulario de contacto:

- Dirección: `Calle Mallorca nº 214, 5º 1ª, 08008 Barcelona`
- Teléfono / WhatsApp: `+34 93 668 11 58`
- Email: `gestoria@gestoriacampalans.com`

## Logo e imágenes — procedencia real

- `docs/assets/logo-icono-c.png` — icono "C" recortado del logotipo oficial
  del sitio de referencia (sin recolorear ni redibujar). El wordmark
  "Homologaciones Campalans" se renderiza como texto HTML junto al icono
  (no como imagen), para que sea nítido a cualquier resolución y refleje el
  nombre de marca correcto.
- `docs/assets/favicon-campalans.png` — el mismo icono "C" compuesto sobre
  un fondo navy cuadrado, para uso como favicon.
- `docs/assets/hero-banner.webp` — fondo del hero (vehículo y gráfica de
  matrícula/importación), tomado tal cual del sitio de referencia.
- `docs/assets/experiencia-grafico-c.png` — elemento gráfico en forma de
  "C" del bloque de experiencia.
- `docs/assets/transporte-vehiculos.webp` — fotografía de vehículos sobre
  un camión de transporte, banda horizontal a todo el ancho.
- `docs/assets/interior-lujo.webp` — fotografía de interior de vehículo,
  usada en el bloque final de contacto.

## Paleta de color

Variables CSS en `:root` (`docs/styles.css`):

| Variable | Valor | Uso |
|---|---|---|
| `--color-navy` | `#032A3F` | Navy principal (cabecera, hero, fases, contacto, footer) |
| `--color-navy-light` | `#053C5A` | Navy secundaria (tarjeta de marca del footer, barra inferior) |
| `--color-secondary` | `#F3FAFF` | Fondo casi blanco (tarjetas de consultoría, bloque de experiencia) |
| `--color-white` | `#FFFFFF` | Blanco |
| `--color-accent` | `#CDFF6F` | Verde lima — acento (botones, números de fase, hover) |
| `--color-accent-hover` | `#ABD55D` | Verde lima oscurecido (hover del botón de envío) |
| `--color-accent-text` | `#4E5E00` | Texto oliva oscuro sobre fondos verde lima |
| `--color-body-muted` | `#697988` | Texto de párrafo secundario |
| `--color-border` | `#B3D0EA` | Bordes de las tarjetas de fases |
| `--color-label` | `#828282` | Etiquetas y campos del formulario |
| `--color-icon` | `#5DA0C4` | Icono de las tarjetas de consultoría |

## Tipografía

Montserrat (títulos, botones, navegación) e Inter (campos del formulario),
cargadas desde Google Fonts.

## Formulario de contacto — configuración del envío de correo

El formulario (`#contactForm` en `docs/index.html`, gestionado en
`docs/script.js`) tiene los campos Nombre (opcional), Correo electrónico,
Número de teléfono, Mensaje y la casilla de aceptación del aviso legal
(obligatorios), con validación en el cliente y mensajes de error accesibles
(`role="alert"`).

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
- Menú móvil con `aria-expanded` y cierre automático al navegar.

## Pendiente antes de publicar

1. Configurar `CONTACT_FORM_ENDPOINT` en `docs/script.js` para el envío real
   de correos.
2. Redactar y enlazar un texto legal real para el enlace "aviso legal" del
   formulario y los enlaces de Aviso Legal / Privacidad / Cookies del pie
   de página (por ahora son anclas `#` de marcador de posición).
