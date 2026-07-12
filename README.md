# Homologaciones Campalans — Sitio web corporativo

Sitio web informativo para Homologaciones Campalans (importación, homologación y
matriculación de vehículos). Construido con HTML5 semántico, CSS moderno y
JavaScript vanilla, sin frameworks ni dependencias de build.

## Archivos del proyecto

- `index.html` — estructura y contenido de la página.
- `styles.css` — estilos, paleta de color y sistema responsive.
- `script.js` — menú móvil, validación del formulario de contacto y año del copyright.
- `assets/` — logo oficial y fotografías reales (ver procedencia más abajo).
- `README.md` — este documento.

## Cómo ejecutar el sitio en local

```bash
cd Fotos-Coches
python3 -m http.server 8000
```

Y abrir `http://localhost:8000` en el navegador.

## Procedencia del contenido

No se recibió un PDF independiente con la información de la empresa. El cliente
confirmó que los únicos materiales disponibles son el logotipo oficial y la
maqueta comparativa de colores (el mismo archivo de referencia visual del
encargo). Todo el contenido de este build se ha extraído de esos dos archivos:

- **Textos literales tomados de la maqueta** (verificados ampliando la imagen
  varias veces): el titular "Especialistas en la importación de vehículos
  desde Dubai", "Así traemos tu coche a España", los títulos de las 6 fases
  del proceso (Compra/revisión/entrega en origen, Transporte, Aduanas,
  Matriculación provisional, Homologación ITV, Matriculación definitiva),
  "¿Quieres una consultoría 1 a 1?", los 4 puntos de la consultoría (Dónde y
  cómo comprar / Cómo exportar el vehículo de origen / Con quién
  transportarlo / Cómo matricular en España y liquidar impuestos), "Llevamos
  más de 10 años moviendo coches por el mundo", "También traemos coches de
  USA, Canadá y Europa", "El coche que sueñas te está esperando" y las
  etiquetas de los botones.
- **Párrafos de apoyo** (subtítulo del hero, introducción, texto de la
  consultoría, experiencia, origen y contacto final): el cuerpo de texto de la
  maqueta es ilegible incluso ampliado (resolución insuficiente), así que
  estos párrafos breves los he redactado yo, apoyándome únicamente en los
  datos ya confirmados (proceso completo de compra–transporte–aduanas–
  homologación–matriculación, más de 10 años de experiencia, orígenes en
  Dubai/EAU, EE. UU., Canadá y Europa). No contienen precios, certificaciones,
  garantías ni estadísticas no confirmadas.
- **Sección "Por qué Campalans"**: la maqueta no incluye una sección de
  motivos independiente y no hay PDF, así que las 4 tarjetas de esta sección
  son una reformulación de los 4 hechos ya confirmados arriba (experiencia,
  acompañamiento integral, orígenes múltiples, asesoramiento personalizado),
  no motivos nuevos inventados.
- **Nombres de los apartados del menú** ("Servicios", "Cómo funciona", "Por
  qué Campalans"): tal y como los pedía el encargo original, no los de la
  maqueta.

## Datos de contacto

Email y teléfono/WhatsApp oficiales, confirmados por el cliente:

- Email: `homologaciones@gestoriacampalans.com`
- Teléfono / WhatsApp: `931 27 99 03`

Aparecen como enlaces `mailto:` y `tel:` en la sección de contacto y en el
pie de página. Ya no queda ningún dato de contacto pendiente.

## Logo e imágenes — procedencia real

El logo y las fotografías que se ven en el sitio **no son placeholders**:
se han extraído directamente de los archivos originales que el cliente
adjuntó en la conversación (el logotipo oficial en alta resolución, y la
maqueta de diseño, que incluye fotografías reales incrustadas).

- `assets/logo-campalans.png` — logotipo oficial completo, usado tal cual,
  sin recolorear, recortar ni aplicar efectos. En el pie de página (fondo
  oscuro) se apoya sobre una placa blanca (`.site-footer__brand`) para que
  se lea correctamente, sin modificar el archivo del logo en sí.
- `assets/favicon-campalans.png` — recorte cuadrado del icono "C" del propio
  logo oficial (mismo archivo, sin redibujar).
- `assets/hero-vehiculo-importado.jpg` — recorte del vehículo y la gráfica de
  matrícula/importación que aparece en el hero de la maqueta.
- `assets/transporte-vehiculos.jpg` — fotografía de vehículos sobre un
  camión de transporte, tomada de la banda de imagen de la maqueta.
- `assets/conduccion-campalans.jpg` — fotografía de un conductor al volante,
  tomada de la sección final de contacto de la maqueta.

**Aviso de calidad de imagen**: estas fotografías proceden de una maqueta de
diseño pensada para visualizarse en miniatura, no de archivos fotográficos
originales a resolución completa. Se han recortado y escalado lo mejor
posible, pero su resolución nativa es limitada (por ejemplo, la foto del
hero es de ~645×489 px). Si el cliente dispone en algún momento de las
fotografías originales a resolución completa, deben sustituir a estos
recortes para una calidad óptima en pantallas grandes.

## Paleta de color

Variante usada: **fila superior, recuadro central** de la maqueta de
referencia, confirmada por el cliente. Variables CSS en `:root`
(`styles.css`):

| Variable | Valor | Uso |
|---|---|---|
| `--color-navy-900` | `#001622` | Navy principal (fondos oscuros, texto) |
| `--color-navy-800` | `#032A3F` | Navy secundaria (tarjetas sobre fondo oscuro) |
| `--color-grey-700` | `#35414F` | Gris oscuro (texto secundario) |
| `--color-cyan` | `#00DDFF` | Acento (botones, números de fase, detalles) |
| `--color-white` | `#FFFFFF` | Blanco |

No se ha usado ningún color fuera de esta paleta.

## Tipografía

Montserrat, cargada desde Google Fonts (pesos 400, 500, 600 y 700).

## Formulario de contacto — configuración del envío de correo

El formulario (`#contactForm` en `index.html`, gestionado en `script.js`)
valida en el cliente: campos obligatorios, formato de email, formato de
teléfono y aceptación obligatoria de la política de privacidad, con mensajes
de error accesibles (`role="alert"`).

**El envío de correo real todavía no está conectado.** En `script.js`:

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

1. Configurar `CONTACT_FORM_ENDPOINT` en `script.js` para el envío real de
   correos.
2. Redactar y enlazar los textos legales de "Aviso legal" y "Política de
   privacidad" (no se ha recibido ningún texto legal).
3. Si aparecen las fotografías originales a resolución completa, sustituir
   los recortes de `assets/` para mejorar la nitidez en pantallas grandes.
4. Revisar y, si el cliente lo desea, ampliar los párrafos de apoyo
   redactados por no ser legibles en la maqueta original (ver sección
   "Procedencia del contenido" arriba).
