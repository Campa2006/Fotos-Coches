import * as XLSX from 'xlsx';
import type { Empresa } from '../types';
import { formatearFecha } from './format';

export function exportarEmpresasAExcel(empresas: Empresa[]): void {
  const filas = empresas.map((e) => ({
    'Razón social': e.razon_social,
    Municipio: e.municipio ?? '',
    'Página web': e.pagina_web ?? '',
    LinkedIn: e.linkedin ?? '',
    Email: e.email ?? '',
    Teléfono: e.telefono ?? '',
    Tamaño: e.tamano,
    Estado: e.estado,
    'Fecha de contacto': formatearFecha(e.fecha_contacto),
    Observaciones: e.observaciones ?? '',
  }));

  const hoja = XLSX.utils.json_to_sheet(filas);
  hoja['!cols'] = [
    { wch: 38 }, // Razón social
    { wch: 22 }, // Municipio
    { wch: 30 }, // Página web
    { wch: 34 }, // LinkedIn
    { wch: 28 }, // Email
    { wch: 20 }, // Teléfono
    { wch: 20 }, // Tamaño
    { wch: 14 }, // Estado
    { wch: 16 }, // Fecha de contacto
    { wch: 40 }, // Observaciones
  ];

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Empresas');

  const hoy = new Date();
  const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(
    hoy.getDate(),
  ).padStart(2, '0')}`;
  XLSX.writeFile(libro, `empresas-campalans-${fecha}.xlsx`);
}
