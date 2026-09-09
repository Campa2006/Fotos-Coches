export const CATEGORIAS_TAMANO = [
  '1-10 empleados',
  '11-50 empleados',
  '51-200 empleados',
  '201-500 empleados',
  '501-1.000 empleados',
  'Más de 1.000 empleados',
  'No encontrado',
] as const;

export type CategoriaTamano = (typeof CATEGORIAS_TAMANO)[number];

export type Estado = 'No contactado' | 'Contactado';

export interface Empresa {
  id: string;
  razon_social: string;
  municipio: string | null;
  pagina_web: string | null;
  linkedin: string | null;
  email: string | null;
  telefono: string | null;
  tamano: CategoriaTamano;
  estado: Estado;
  fecha_contacto: string | null; // formato ISO "YYYY-MM-DD"
  observaciones: string | null;
  creado_en: string;
  actualizado_en: string;
}

export type NuevaEmpresa = Omit<Empresa, 'id' | 'creado_en' | 'actualizado_en'>;
