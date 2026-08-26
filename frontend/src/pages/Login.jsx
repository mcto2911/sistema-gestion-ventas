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
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
    <div className="card shadow-sm" style={{ width: '380px' }}>
      <div className="card-body p-4">
        <h3 className="text-center mb-4">Iniciar sesión</h3>
        <form onSubmit={manejarSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button type="submit" className="btn btn-primary w-100" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  </div>
);
}

export default Login;