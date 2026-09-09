import { useState } from 'react';
import type { Empresa, NuevaEmpresa } from '../types';
import { CATEGORIAS_TAMANO } from '../types';
import { actualizarEmpresa, eliminarEmpresa } from '../lib/empresasApi';
import {
  fechaHoyISO,
  formatearFecha,
  mailtoHref,
  telefonoParaLlamar,
  urlLinkedin,
  urlWeb,
} from '../lib/format';

interface Props {
  empresa: Empresa;
  onActualizada: (empresa: Empresa) => void;
  onEliminada: (id: string) => void;
}

type Borrador = NuevaEmpresa;

function borradorDesde(e: Empresa): Borrador {
  return {
    razon_social: e.razon_social,
    municipio: e.municipio,
    pagina_web: e.pagina_web,
    linkedin: e.linkedin,
    email: e.email,
    telefono: e.telefono,
    tamano: e.tamano,
    estado: e.estado,
    fecha_contacto: e.fecha_contacto,
    observaciones: e.observaciones,
  };
}

export default function CompanyRow({ empresa, onActualizada, onEliminada }: Props) {
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState<Borrador>(() => borradorDesde(empresa));
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  function mostrarGuardadoOk() {
    setGuardadoOk(true);
    setTimeout(() => setGuardadoOk(false), 1800);
  }

  async function guardarCambios(cambios: Partial<NuevaEmpresa>) {
    setGuardando(true);
    setErrorGuardado(null);
    try {
      const actualizada = await actualizarEmpresa(empresa.id, cambios);
      onActualizada(actualizada);
      mostrarGuardadoOk();
    } catch (e) {
      setErrorGuardado('No se pudo guardar. Comprueba tu conexión e inténtalo de nuevo.');
      console.error(e);
    } finally {
      setGuardando(false);
    }
  }

  async function marcarContactada() {
    await guardarCambios({
      estado: 'Contactado',
      fecha_contacto: empresa.fecha_contacto ?? fechaHoyISO(),
    });
  }

  async function marcarNoContactada() {
    if (!confirm('¿Marcar esta empresa como "No contactado" de nuevo?')) return;
    await guardarCambios({ estado: 'No contactado' });
  }

  function iniciarEdicion() {
    setBorrador(borradorDesde(empresa));
    setEditando(true);
    setErrorGuardado(null);
  }

  function cancelarEdicion() {
    setEditando(false);
    setErrorGuardado(null);
  }

  async function guardarEdicion() {
    await guardarCambios(borrador);
    setEditando(false);
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar definitivamente "${empresa.razon_social}" del registro?`)) return;
    setGuardando(true);
    try {
      await eliminarEmpresa(empresa.id);
      onEliminada(empresa.id);
    } catch (e) {
      setErrorGuardado('No se pudo eliminar. Inténtalo de nuevo.');
      console.error(e);
    } finally {
      setGuardando(false);
    }
  }

  const web = urlWeb(empresa.pagina_web);
  const linkedin = urlLinkedin(empresa.linkedin);
  const tel = telefonoParaLlamar(empresa.telefono);
  const mailto = mailtoHref(empresa.email);

  if (editando) {
    return (
      <tr className="fila-empresa fila-empresa--editando">
        <td colSpan={9}>
          <div className="formulario-edicion">
            <label>
              <span>Razón social</span>
              <input
                value={borrador.razon_social}
                onChange={(e) => setBorrador({ ...borrador, razon_social: e.target.value })}
              />
            </label>
            <label>
              <span>Municipio</span>
              <input
                value={borrador.municipio ?? ''}
                onChange={(e) => setBorrador({ ...borrador, municipio: e.target.value || null })}
              />
            </label>
            <label>
              <span>Página web</span>
              <input
                value={borrador.pagina_web ?? ''}
                onChange={(e) => setBorrador({ ...borrador, pagina_web: e.target.value || null })}
              />
            </label>
            <label>
              <span>LinkedIn</span>
              <input
                value={borrador.linkedin ?? ''}
                onChange={(e) => setBorrador({ ...borrador, linkedin: e.target.value || null })}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                value={borrador.email ?? ''}
                onChange={(e) => setBorrador({ ...borrador, email: e.target.value || null })}
              />
            </label>
            <label>
              <span>Teléfono</span>
              <input
                value={borrador.telefono ?? ''}
                onChange={(e) => setBorrador({ ...borrador, telefono: e.target.value || null })}
              />
            </label>
            <label>
              <span>Tamaño</span>
              <select
                value={borrador.tamano}
                onChange={(e) =>
                  setBorrador({ ...borrador, tamano: e.target.value as Borrador['tamano'] })
                }
              >
                {CATEGORIAS_TAMANO.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Estado</span>
              <select
                value={borrador.estado}
                onChange={(e) =>
                  setBorrador({ ...borrador, estado: e.target.value as Borrador['estado'] })
                }
              >
                <option value="No contactado">No contactado</option>
                <option value="Contactado">Contactado</option>
              </select>
            </label>
            <label>
              <span>Fecha de contacto</span>
              <input
                type="date"
                value={borrador.fecha_contacto ?? ''}
                onChange={(e) =>
                  setBorrador({ ...borrador, fecha_contacto: e.target.value || null })
                }
              />
            </label>
            <label className="campo-ancho">
              <span>Observaciones de contacto</span>
              <textarea
                rows={2}
                value={borrador.observaciones ?? ''}
                onChange={(e) =>
                  setBorrador({ ...borrador, observaciones: e.target.value || null })
                }
              />
            </label>
          </div>

          {errorGuardado && <p className="texto-error">{errorGuardado}</p>}

          <div className="acciones-edicion">
            <button className="boton boton-primario" onClick={guardarEdicion} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button className="boton boton-secundario" onClick={cancelarEdicion} disabled={guardando}>
              Cancelar
            </button>
            <button className="boton boton-peligro" onClick={eliminar} disabled={guardando}>
              Eliminar empresa
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="fila-empresa">
      <td className="col-razon-social">
        <span className="texto-fuerte">{empresa.razon_social}</span>
      </td>
      <td>{empresa.municipio || '—'}</td>
      <td>
        {mailto ? (
          <a href={mailto} className="enlace">
            {empresa.email}
          </a>
        ) : (
          <span className="texto-apagado">Sin dato</span>
        )}
      </td>
      <td>
        {tel ? (
          <a href={`tel:${tel}`} className="enlace">
            {empresa.telefono}
          </a>
        ) : (
          <span className="texto-apagado">Sin dato</span>
        )}
      </td>
      <td className="col-enlaces">
        <a
          className={`boton-enlace ${!web ? 'boton-enlace--deshabilitado' : ''}`}
          href={web ?? undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!web}
          onClick={(e) => !web && e.preventDefault()}
        >
          Web
        </a>
        <a
          className={`boton-enlace ${!linkedin ? 'boton-enlace--deshabilitado' : ''}`}
          href={linkedin ?? undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!linkedin}
          onClick={(e) => !linkedin && e.preventDefault()}
        >
          LinkedIn
        </a>
      </td>
      <td>
        <span
          className={`insignia ${
            empresa.estado === 'Contactado' ? 'insignia--contactado' : 'insignia--no-contactado'
          }`}
        >
          {empresa.estado}
        </span>
      </td>
      <td>{formatearFecha(empresa.fecha_contacto)}</td>
      <td className="col-observaciones" title={empresa.observaciones ?? ''}>
        {empresa.observaciones ? (
          <span className="texto-truncado">{empresa.observaciones}</span>
        ) : (
          <span className="texto-apagado">—</span>
        )}
      </td>
      <td className="col-acciones">
        {guardadoOk && <span className="confirmacion-guardado">Guardado ✓</span>}
        {empresa.estado === 'No contactado' ? (
          <button className="boton boton-marcar" onClick={marcarContactada} disabled={guardando}>
            Marcar contactada
          </button>
        ) : (
          <button className="boton boton-secundario boton-pequeno" onClick={marcarNoContactada} disabled={guardando}>
            Revertir
          </button>
        )}
        <button className="boton boton-secundario boton-pequeno" onClick={iniciarEdicion}>
          Editar
        </button>
        {errorGuardado && <p className="texto-error texto-error--pequeno">{errorGuardado}</p>}
      </td>
    </tr>
  );
}
