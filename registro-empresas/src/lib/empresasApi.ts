import { supabase } from './supabaseClient';
import type { Empresa, NuevaEmpresa } from '../types';

export async function listarEmpresas(): Promise<Empresa[]> {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .order('razon_social', { ascending: true });
  if (error) throw error;
  return data as Empresa[];
}

export async function crearEmpresa(empresa: NuevaEmpresa): Promise<Empresa> {
  const { data, error } = await supabase.from('empresas').insert(empresa).select().single();
  if (error) throw error;
  return data as Empresa;
}

export async function actualizarEmpresa(
  id: string,
  cambios: Partial<NuevaEmpresa>,
): Promise<Empresa> {
  const { data, error } = await supabase
    .from('empresas')
    .update(cambios)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Empresa;
}

export async function eliminarEmpresa(id: string): Promise<void> {
  const { error } = await supabase.from('empresas').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Inserta varias empresas nuevas de golpe (usado por la importación de Excel).
 * Los duplicados ya se filtran antes de llamar a esta función, pero la base
 * de datos también los rechaza como red de seguridad (índice único).
 */
export async function insertarEmpresasEnLote(empresas: NuevaEmpresa[]): Promise<number> {
  if (empresas.length === 0) return 0;
  const { data, error } = await supabase.from('empresas').insert(empresas).select('id');
  if (error) throw error;
  return data?.length ?? 0;
}
