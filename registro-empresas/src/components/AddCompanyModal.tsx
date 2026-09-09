import { useState } from 'react';
import type { FormEvent } from 'react';
import Modal from './Modal';
import { CATEGORIAS_TAMANO } from '../types';
import type { CategoriaTamano, Empresa } from '../types';
import { crearEmpresa } from '../lib/empresasApi';

interface Props {
  onCerrar: () => void;
  onCreada: (empresa: Empresa) => void;
}

export default function AddCompanyModal({ onCerrar, onCreada }: Props) {
  const [razonSocial, setRazonSocial] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [paginaWeb, setPaginaWeb] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tamano, setTamano] = useState<CategoriaTamano>('No encontrado');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!razonSocial.trim()) {
      setError('La razón social es obligatoria.');
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      const nueva = await crearEmpresa({
        razon_social: razonSocial.trim(),
        municipio: municipio.trim() || null,
        pagina_web: paginaWeb.trim() || null,
        linkedin: linkedin.trim() || null,
        email: email.trim() || null,
        telefono: telefono.trim() || null,
        tamano,
        estado: 'No contactado',
        fecha_contacto: null,
        observaciones: null,
      });
      onCreada(nueva);
      onCerrar();
    } catch (err) {
      const mensaje = String((err as { message?: string })?.message ?? '');
      if (mensaje.includes('empresas_razon_social_unica')) {
        setError('Ya existe una empresa con esa razón social.');
      } else {
        setError('No se pudo guardar la empresa. Inténtalo de nuevo.');
      }
      console.error(err);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Añadir empresa manualmente" onCerrar={onCerrar}>
      <form className="formulario-vertical" onSubmit={handleSubmit}>
        <label>
          <span>Razón social *</span>
          <input
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            autoFocus
            required
          />
        </label>
        <label>
          <span>Municipio</span>
          <input value={municipio} onChange={(e) => setMunicipio(e.target.value)} />
        </label>
        <label>
          <span>Página web</span>
          <input value={paginaWeb} onChange={(e) => setPaginaWeb(e.target.value)} />
        </label>
        <label>
          <span>LinkedIn</span>
          <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
        </label>
        <label>
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          <span>Teléfono</span>
          <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </label>
        <label>
          <span>Tamaño</span>
          <select value={tamano} onChange={(e) => setTamano(e.target.value as CategoriaTamano)}>
            {CATEGORIAS_TAMANO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="texto-error">{error}</p>}

        <div className="acciones-edicion">
          <button type="submit" className="boton boton-primario" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar empresa'}
          </button>
          <button type="button" className="boton boton-secundario" onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
