import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: 'normal' | 'ancho';
}

export default function Modal({ titulo, onCerrar, children, ancho = 'normal' }: Props) {
  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div
        className={`modal-caja ${ancho === 'ancho' ? 'modal-caja--ancha' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-cabecera">
          <h2>{titulo}</h2>
          <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className="modal-cuerpo">{children}</div>
      </div>
    </div>
  );
}
