import { useState } from 'react';
import { cambiarPassword } from '../services/api';

function ModalCambiarPassword({ visible, onClose }) {
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setExito('');

    if (!contrasenaActual || !contrasenaNueva || !confirmar) {
      setError('Completa todos los campos');
      return;
    }

    if (contrasenaNueva !== confirmar) {
      setError('Las nuevas contraseñas no coinciden');
      return;
    }

    if (contrasenaNueva.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    setEnviando(true);

    const respuesta = await cambiarPassword(contrasenaActual, contrasenaNueva);

    setEnviando(false);

    if (respuesta.exito) {
      setExito('Contraseña cambiada correctamente');
      setTimeout(() => {
        setContrasenaActual('');
        setContrasenaNueva('');
        setConfirmar('');
        onClose();
      }, 1500);
    } else {
      setError(respuesta.mensaje || 'Error al cambiar la contraseña');
    }
  }

  if (!visible) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(58, 50, 43, 0.5)',
          zIndex: 1040,
        }}
      />

      {/* Modal centrado */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '420px',
          width: '90%',
          zIndex: 1050,
          boxShadow: '0 20px 60px rgba(58, 50, 43, 0.3)',
          borderTop: '4px solid var(--color-primary)',
        }}
      >
        <h4 style={{ marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Cambiar contraseña</h4>

        <form onSubmit={manejarSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Contraseña actual
            </label>
            <input
              type="password"
              className="form-control"
              value={contrasenaActual}
              onChange={(e) => setContrasenaActual(e.target.value)}
              disabled={enviando}
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Nueva contraseña
            </label>
            <input
              type="password"
              className="form-control"
              value={contrasenaNueva}
              onChange={(e) => setContrasenaNueva(e.target.value)}
              disabled={enviando}
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              className="form-control"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              disabled={enviando}
            />
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}
          {exito && <div className="alert alert-success py-2">{exito}</div>}

          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-marca"
              style={{ flex: 1 }}
              disabled={enviando}
            >
              {enviando ? 'Cambiando...' : 'Cambiar'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ModalCambiarPassword;