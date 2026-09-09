import { useEffect, useMemo, useState } from 'react';
import type { CategoriaTamano, Empresa } from '../types';
import { ORDEN_TAMANOS } from '../lib/size';
import { listarEmpresas } from '../lib/empresasApi';
import { exportarEmpresasAExcel } from '../lib/excelExport';
import { supabase } from '../lib/supabaseClient';
import CompanyRow from './CompanyRow';
import AddCompanyModal from './AddCompanyModal';
import ImportExcelModal from './ImportExcelModal';

interface Props {
  usuarioEmail: string;
}

type FiltroEstado = 'Todos' | 'No contactado' | 'Contactado';

const TITULO_GRUPO: Record<CategoriaTamano, string> = {
  '1-10 empleados': '1 – 10 empleados',
  '11-50 empleados': '11 – 50 empleados',
  '51-200 empleados': '51 – 200 empleados',
  '201-500 empleados': '201 – 500 empleados',
  '501-1.000 empleados': '501 – 1.000 empleados',
  'Más de 1.000 empleados': 'Más de 1.000 empleados',
  'No encontrado': 'Tamaño no encontrado',
};

export default function Dashboard({ usuarioEmail }: Props) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroTamano, setFiltroTamano] = useState<CategoriaTamano | 'Todos'>('Todos');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('Todos');
  const [gruposColapsados, setGruposColapsados] = useState<Set<string>>(new Set());

  const [mostrarAlta, setMostrarAlta] = useState(false);
  const [mostrarImportar, setMostrarImportar] = useState(false);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  async function cargarEmpresas() {
    setCargando(true);
    setErrorCarga(null);
    try {
      const datos = await listarEmpresas();
      setEmpresas(datos);
    } catch (e) {
      console.error(e);
      setErrorCarga('No se pudieron cargar las empresas. Comprueba tu conexión y recarga la página.');
    } finally {
      setCargando(false);
    }
  }

  function actualizarEnLista(actualizada: Empresa) {
    setEmpresas((prev) => prev.map((e) => (e.id === actualizada.id ? actualizada : e)));
  }

  function eliminarDeLista(id: string) {
    setEmpresas((prev) => prev.filter((e) => e.id !== id));
  }

  function agregarALista(nueva: Empresa) {
    setEmpresas((prev) => [...prev, nueva]);
  }

  const contadores = useMemo(() => {
    const total = empresas.length;
    const contactadas = empresas.filter((e) => e.estado === 'Contactado').length;
    return { total, contactadas, noContactadas: total - contactadas };
  }, [empresas]);

  const empresasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return empresas.filter((e) => {
      if (filtroTamano !== 'Todos' && e.tamano !== filtroTamano) return false;
      if (filtroEstado !== 'Todos' && e.estado !== filtroEstado) return false;
      if (!texto) return true;
      const campos = [e.razon_social, e.municipio, e.email, e.telefono];
      return campos.some((c) => (c ?? '').toLowerCase().includes(texto));
    });
  }, [empresas, busqueda, filtroTamano, filtroEstado]);

  const grupos = useMemo(() => {
    const mapa = new Map<CategoriaTamano, Empresa[]>();
    for (const tamano of ORDEN_TAMANOS) mapa.set(tamano, []);
    for (const e of empresasFiltradas) mapa.get(e.tamano)?.push(e);
    return ORDEN_TAMANOS.map((tamano) => ({ tamano, empresas: mapa.get(tamano) ?? [] })).filter(
      (g) => g.empresas.length > 0,
    );
  }, [empresasFiltradas]);

  function alternarGrupo(tamano: string) {
    setGruposColapsados((prev) => {
      const copia = new Set(prev);
      if (copia.has(tamano)) copia.delete(tamano);
      else copia.add(tamano);
      return copia;
    });
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return (
    <div className="app-shell">
      <header className="cabecera">
        <div>
          <h1>Gestoría Campalans</h1>
          <p className="cabecera__subtitulo">Registro de empresas contactadas</p>
        </div>
        <div className="cabecera__usuario">
          <span>{usuarioEmail}</span>
          <button className="boton boton-secundario boton-pequeno" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="resumen">
        <div className="resumen__tarjeta">
          <span className="resumen__numero">{contadores.total}</span>
          <span className="resumen__etiqueta">Total de empresas</span>
        </div>
        <div className="resumen__tarjeta resumen__tarjeta--pendiente">
          <span className="resumen__numero">{contadores.noContactadas}</span>
          <span className="resumen__etiqueta">No contactadas</span>
        </div>
        <div className="resumen__tarjeta resumen__tarjeta--ok">
          <span className="resumen__numero">{contadores.contactadas}</span>
          <span className="resumen__etiqueta">Contactadas</span>
        </div>
      </section>

      <section className="barra-herramientas">
        <input
          className="buscador"
          type="search"
          placeholder="Buscar por razón social, municipio, email o teléfono…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select value={filtroTamano} onChange={(e) => setFiltroTamano(e.target.value as CategoriaTamano | 'Todos')}>
          <option value="Todos">Todos los tamaños</option>
          {ORDEN_TAMANOS.map((t) => (
            <option key={t} value={t}>
              {TITULO_GRUPO[t]}
            </option>
          ))}
        </select>

        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}>
          <option value="Todos">Todos los estados</option>
          <option value="No contactado">No contactadas</option>
          <option value="Contactado">Contactadas</option>
        </select>

        <div className="barra-herramientas__acciones">
          <button className="boton boton-primario" onClick={() => setMostrarAlta(true)}>
            + Añadir empresa
          </button>
          <button className="boton boton-secundario" onClick={() => setMostrarImportar(true)}>
            Importar Excel
          </button>
          <button
            className="boton boton-secundario"
            onClick={() => exportarEmpresasAExcel(empresas)}
            disabled={empresas.length === 0}
          >
            Exportar a Excel
          </button>
        </div>
      </section>

      {errorCarga && <p className="texto-error">{errorCarga}</p>}

      {cargando ? (
        <p className="texto-apagado">Cargando empresas…</p>
      ) : grupos.length === 0 ? (
        <p className="texto-apagado">No hay empresas que coincidan con la búsqueda o los filtros.</p>
      ) : (
        grupos.map(({ tamano, empresas: empresasGrupo }) => {
          const colapsado = gruposColapsados.has(tamano);
          return (
            <section className="grupo-tamano" key={tamano}>
              <button className="grupo-tamano__cabecera" onClick={() => alternarGrupo(tamano)}>
                <span className="grupo-tamano__flecha">{colapsado ? '▶' : '▼'}</span>
                <span className="grupo-tamano__titulo">{TITULO_GRUPO[tamano]}</span>
                <span className="grupo-tamano__contador">{empresasGrupo.length}</span>
              </button>

              {!colapsado && (
                <div className="tabla-contenedor">
                  <table className="tabla-empresas">
                    <thead>
                      <tr>
                        <th>Razón social</th>
                        <th>Municipio</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Enlaces</th>
                        <th>Estado</th>
                        <th>Fecha de contacto</th>
                        <th>Observaciones</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empresasGrupo.map((empresa) => (
                        <CompanyRow
                          key={empresa.id}
                          empresa={empresa}
                          onActualizada={actualizarEnLista}
                          onEliminada={eliminarDeLista}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })
      )}

      {mostrarAlta && (
        <AddCompanyModal onCerrar={() => setMostrarAlta(false)} onCreada={agregarALista} />
      )}

      {mostrarImportar && (
        <ImportExcelModal
          empresasActuales={empresas}
          onCerrar={() => setMostrarImportar(false)}
          onImportadas={setEmpresas}
        />
      )}
    </div>
  );
}
