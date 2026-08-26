import { useState } from 'react';
import { login } from '../services/api';

function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(evento) {
    evento.preventDefault(); // evita que la página se recargue (comportamiento por defecto de los formularios)
    setError('');
    setCargando(true);

    const respuesta = await login(email, password);

    setCargando(false);

    if (respuesta.exito) {
      onLoginExitoso(respuesta.usuario); // avisamos al componente padre (App) que el login funcionó
    } else {
      setError(respuesta.mensaje || 'Error al iniciar sesión');
    }
  }

  return (
  <div className="fondo-login">
    <div className="tarjeta-cristal">
      <div className="text-center mb-4">
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 2.3c-.6.6-.2 1.7.7 1.7H17M17 17a2 2 0 100 4 2 2 0 000-4zM9 17a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Sistema de Ventas</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Portal para empleados y administradores
        </p>
      </div>

      <form onSubmit={manejarSubmit}>
        <div className="mb-3">
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Correo</label>
          <div className="input-con-icono">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
              <path d="M3 6l9 6 9-6" />
            </svg>
            <input
              type="email"
              className="form-control"
              placeholder="tucorreo@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Contraseña</label>
          <div className="input-con-icono">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <input
              type="password"
              className="form-control"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="text-end mb-3">
          <a href="#" style={{ fontSize: '0.85rem', color: 'var(--color-primary-dark)' }}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button type="submit" className="btn-degradado w-100" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Iniciar sesión segura'}
          {!cargando && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </form>
    </div>
  </div>
);
}

export default Login;