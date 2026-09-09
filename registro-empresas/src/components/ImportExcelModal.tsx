import { useState } from 'react';
import type { ChangeEvent } from 'react';
import Modal from './Modal';
import type { Empresa } from '../types';
import { filtrarDuplicados, leerExcelEmpresas } from '../lib/excelImport';
import { insertarEmpresasEnLote, listarEmpresas } from '../lib/empresasApi';

interface Props {
  empresasActuales: Empresa[];
  onCerrar: () => void;
  onImportadas: (empresas: Empresa[]) => void;
}

type Estado =
  | { paso: 'inicial' }
  | { paso: 'procesando' }
  | { paso: 'resultado'; importadas: number; duplicadas: number; total: number }
  | { paso: 'error'; mensaje: string };

export default function ImportExcelModal({ empresasActuales, onCerrar, onImportadas }: Props) {
  const [estado, setEstado] = useState<Estado>({ paso: 'inicial' });

  async function handleArchivo(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setEstado({ paso: 'procesando' });

    try {
      const { filas } = await leerExcelEmpresas(archivo);
      const razonesExistentes = empresasActuales.map((e) => e.razon_social);
      const { aImportar, duplicadas, totalEnArchivo } = filtrarDuplicados(
        filas,
        razonesExistentes,
      );

      await insertarEmpresasEnLote(aImportar);

      // Volvemos a leer de Supabase para tener el listado completo y
      // consistente (incluye los id generados por la base de datos).
      const listadoCompleto = await listarEmpresas();
      onImportadas(listadoCompleto);

      setEstado({
        paso: 'resultado',
        importadas: aImportar.length,
        duplicadas,
        total: totalEnArchivo,
      });
    } catch (err) {
      console.error(err);
      const mensaje =
        err instanceof Error ? err.message : 'No se pudo procesar el archivo Excel.';
      setEstado({ paso: 'error', mensaje });
    } finally {
      e.target.value = '';
    }
  }

  return (
    <Modal titulo="Importar Excel" onCerrar={onCerrar}>
      <div className="importar-cuerpo">
        <p>
          Selecciona un archivo Excel con las mismas columnas del listado original (Razón
          social, Municipio, Página web, LinkedIn, Email general/comercial, Teléfono y Tamaño
          aproximado de empresa). Las empresas cuya razón social ya exista en el registro se
          descartarán automáticamente como duplicadas.
        </p>

        {estado.paso === 'inicial' && (
          <label className="boton boton-primario boton-archivo">
            Seleccionar archivo Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleArchivo} hidden />
          </label>
        )}

        {estado.paso === 'procesando' && <p className="texto-apagado">Procesando archivo…</p>}

        {estado.paso === 'resultado' && (
          <div className="resultado-importacion">
            <p>
              Archivo procesado: <strong>{estado.total}</strong> empresas leídas.
            </p>
            <p className="resultado-importacion__ok">
              ✓ {estado.importadas} empresas nuevas importadas.
            </p>
            <p className="resultado-importacion__descartadas">
              ⚠ {estado.duplicadas} descartadas por estar ya en el registro (razón social
              duplicada).
            </p>
            <button className="boton boton-secundario" onClick={onCerrar}>
              Cerrar
            </button>
          </div>
        )}

        {estado.paso === 'error' && (
          <div>
            <p className="texto-error">{estado.mensaje}</p>
            <button className="boton boton-secundario" onClick={() => setEstado({ paso: 'inicial' })}>
              Volver a intentar
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
