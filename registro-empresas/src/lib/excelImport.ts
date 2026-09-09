import * as XLSX from 'xlsx';
import type { NuevaEmpresa } from '../types';
import { normalizarTamano } from './size';
import { normalizarRazonSocial } from './format';

// Nombres de columna esperados en el Excel (los mismos del listado original).
// La búsqueda ignora mayúsculas/minúsculas y espacios sobrantes, así que
// admite variaciones menores de formato entre archivos.
const COLUMNAS_ESPERADAS: Record<string, string> = {
  razon_social: 'razón social, si está disponible',
  municipio: 'municipio',
  pagina_web: 'página web',
  linkedin: 'linkedin',
  email: 'email general/comercial',
  telefono: 'teléfono',
  tamano: 'tamaño aproximado de empresa',
};

function normalizarEncabezado(v: unknown): string {
  return String(v ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function celdaTexto(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const texto = String(v).trim();
  return texto === '' ? null : texto;
}

export interface ResultadoLecturaExcel {
  filas: Array<{
    razon_social: string;
    municipio: string | null;
    pagina_web: string | null;
    linkedin: string | null;
    email: string | null;
    telefono: string | null;
    tamano: ReturnType<typeof normalizarTamano>;
  }>;
}

/** Lee el archivo Excel y localiza automáticamente la fila de encabezados. */
export async function leerExcelEmpresas(archivo: File): Promise<ResultadoLecturaExcel> {
  const bytes = await archivo.arrayBuffer();
  const libro = XLSX.read(bytes, { type: 'array' });
  const hoja = libro.Sheets[libro.SheetNames[0]];
  if (!hoja) {
    throw new Error('El archivo no contiene ninguna hoja de cálculo.');
  }

  const filasCrudas: unknown[][] = XLSX.utils.sheet_to_json(hoja, {
    header: 1,
    defval: null,
    blankrows: false,
  });

  let indiceEncabezado = -1;
  let mapaColumnas: Record<string, number> = {};

  for (let i = 0; i < Math.min(filasCrudas.length, 20); i++) {
    const fila = filasCrudas[i];
    const encabezadosNormalizados = fila.map(normalizarEncabezado);
    const mapaCandidato: Record<string, number> = {};
    let coincidencias = 0;
    for (const [campo, nombreEsperado] of Object.entries(COLUMNAS_ESPERADAS)) {
      const idx = encabezadosNormalizados.findIndex((h) => h === nombreEsperado);
      if (idx !== -1) {
        mapaCandidato[campo] = idx;
        coincidencias++;
      }
    }
    // Consideramos que es la fila de encabezados si encontramos al menos
    // la columna de razón social y 3 más de las esperadas.
    if (mapaCandidato.razon_social !== undefined && coincidencias >= 4) {
      indiceEncabezado = i;
      mapaColumnas = mapaCandidato;
      break;
    }
  }

  if (indiceEncabezado === -1) {
    throw new Error(
      'No se ha encontrado la fila de encabezados esperada en el Excel. ' +
        'Comprueba que el archivo tiene las columnas: Razón social, Municipio, Página web, ' +
        'LinkedIn, Email general/comercial, Teléfono y Tamaño aproximado de empresa.',
    );
  }

  const filas: ResultadoLecturaExcel['filas'] = [];
  for (let i = indiceEncabezado + 1; i < filasCrudas.length; i++) {
    const fila = filasCrudas[i];
    if (!fila || fila.every((c) => c === null || String(c).trim() === '')) continue;

    const obtener = (campo: string): string | null => {
      const idx = mapaColumnas[campo];
      if (idx === undefined) return null;
      return celdaTexto(fila[idx]);
    };

    const razonSocial = obtener('razon_social') ?? 'NO ENCONTRADO';

    filas.push({
      razon_social: razonSocial,
      municipio: obtener('municipio'),
      pagina_web: obtener('pagina_web'),
      linkedin: obtener('linkedin'),
      email: obtener('email'),
      telefono: obtener('telefono'),
      tamano: normalizarTamano(obtener('tamano')),
    });
  }

  return { filas };
}

export interface ResultadoImportacion {
  aImportar: NuevaEmpresa[];
  duplicadas: number;
  totalEnArchivo: number;
}

/**
 * Filtra las filas leídas del Excel comparando la razón social normalizada
 * con las empresas ya existentes en la base de datos, para no duplicar.
 * Las razones sociales "NO ENCONTRADO" o vacías nunca se consideran
 * duplicadas entre sí: siempre se importan.
 */
export function filtrarDuplicados(
  filas: ResultadoLecturaExcel['filas'],
  razonesSocialesExistentes: string[],
): ResultadoImportacion {
  const vistas = new Set(
    razonesSocialesExistentes
      .map(normalizarRazonSocial)
      .filter((v) => v !== '' && v !== 'no encontrado'),
  );

  const aImportar: NuevaEmpresa[] = [];
  let duplicadas = 0;

  for (const fila of filas) {
    const normalizada = normalizarRazonSocial(fila.razon_social);
    const esComodin = normalizada === '' || normalizada === 'no encontrado';

    if (!esComodin && vistas.has(normalizada)) {
      duplicadas++;
      continue;
    }

    aImportar.push({
      razon_social: fila.razon_social,
      municipio: fila.municipio,
      pagina_web: fila.pagina_web,
      linkedin: fila.linkedin,
      email: fila.email,
      telefono: fila.telefono,
      tamano: fila.tamano,
      estado: 'No contactado',
      fecha_contacto: null,
      observaciones: null,
    });

    if (!esComodin) vistas.add(normalizada);
  }

  return { aImportar, duplicadas, totalEnArchivo: filas.length };
}
