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
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={manejarSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

export default Login;