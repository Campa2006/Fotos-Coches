/** Comprueba si un campo importado del Excel tiene un valor real y utilizable. */
export function tieneDato(valor: string | null | undefined): boolean {
  const texto = (valor ?? '').trim();
  return texto !== '' && texto.toUpperCase() !== 'NO ENCONTRADO';
}

/** Construye una URL http(s) válida a partir del texto de "Página web". */
export function urlWeb(valor: string | null | undefined): string | null {
  if (!tieneDato(valor)) return null;
  const texto = valor!.trim();
  if (/^https?:\/\//i.test(texto)) return texto;
  return `https://${texto}`;
}

/** Construye una URL de LinkedIn válida. */
export function urlLinkedin(valor: string | null | undefined): string | null {
  return urlWeb(valor);
}

/** Extrae el primer número de teléfono de un campo que puede traer varios (separados por "/"). */
export function telefonoParaLlamar(valor: string | null | undefined): string | null {
  if (!tieneDato(valor)) return null;
  const primero = valor!.split('/')[0];
  const soloDigitos = primero.replace(/[^\d+]/g, '');
  return soloDigitos || null;
}

export function mailtoHref(valor: string | null | undefined): string | null {
  if (!tieneDato(valor)) return null;
  return `mailto:${valor!.trim()}`;
}

/** Formatea "YYYY-MM-DD" a "DD/MM/AAAA" para mostrar al usuario. */
export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [anio, mes, dia] = iso.split('-');
  if (!anio || !mes || !dia) return iso;
  return `${dia}/${mes}/${anio}`;
}

/** Fecha de hoy en formato "YYYY-MM-DD", en horario local. */
export function fechaHoyISO(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** Normaliza una razón social para comparar duplicados (minúsculas, espacios colapsados). */
export function normalizarRazonSocial(valor: string | null | undefined): string {
  return (valor ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}
