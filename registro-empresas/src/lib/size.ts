import { CATEGORIAS_TAMANO, type CategoriaTamano } from '../types';

/**
 * Normaliza el texto libre de "tamaño de empresa" que trae el Excel
 * (p.ej. "11–50", "11-50 empleados", "Aprox. 10 empleados",
 * "1.001–5.000 empleados.") a una de las 7 categorías fijas de la app.
 * Se basa en el número más alto que aparezca en el texto.
 */
export function normalizarTamano(valorBruto: string | null | undefined): CategoriaTamano {
  const texto = (valorBruto ?? '').trim();
  if (!texto || texto.toUpperCase() === 'NO ENCONTRADO') {
    return 'No encontrado';
  }

  const coincidencias = texto.match(/\d{1,3}(?:\.\d{3})+|\d+/g);
  if (!coincidencias || coincidencias.length === 0) {
    return 'No encontrado';
  }

  const numeros = coincidencias.map((n) => Number(n.replace(/\./g, '')));
  const maximo = Math.max(...numeros);

  if (maximo <= 10) return '1-10 empleados';
  if (maximo <= 50) return '11-50 empleados';
  if (maximo <= 200) return '51-200 empleados';
  if (maximo <= 500) return '201-500 empleados';
  if (maximo <= 1000) return '501-1.000 empleados';
  return 'Más de 1.000 empleados';
}

/** Orden fijo en el que se agrupan y muestran las categorías de tamaño. */
export const ORDEN_TAMANOS: readonly CategoriaTamano[] = CATEGORIAS_TAMANO;
