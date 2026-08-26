import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import { verificarSesion, logout } from './services/api';
import Ventas from './pages/Ventas';
import Dashboard from './pages/Dashboard';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState('productos');

  useEffect(() => {
    async function checarSesion() {
      const respuesta = await verificarSesion();
      if (respuesta.autenticado) {
        setUsuario(respuesta.usuario);
      }
      setCargandoSesion(false);
    }
    checarSesion();
  }, []);

  async function manejarLogout() {
    await logout();
    setUsuario(null);
  }

  if (cargandoSesion) {
    return <p>Cargando...</p>;
  }

  if (!usuario) {
    return <Login onLoginExitoso={(datosUsuario) => setUsuario(datosUsuario)} />;
  }

 return (
  <div>
    <nav className="navbar navbar-dark bg-dark px-3">
      <span className="navbar-brand mb-0 h1">Sistema de Ventas</span>
      <div className="d-flex align-items-center">
        <span className="text-white me-3">
          {usuario.nombre} <span className="badge bg-secondary">{usuario.rol}</span>
        </span>
        <button className="btn btn-outline-light btn-sm" onClick={manejarLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>

    <div className="container mt-4">
      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${seccionActiva === 'dashboard' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${seccionActiva === 'productos' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('productos')}
          >
            Productos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${seccionActiva === 'clientes' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('clientes')}
          >
            Clientes
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${seccionActiva === 'ventas' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('ventas')}
          >
            Ventas
          </button>
        </li>
      </ul>

      {seccionActiva === 'dashboard' && <Dashboard />}
      {seccionActiva === 'productos' && <Productos />}
      {seccionActiva === 'clientes' && <Clientes />}
      {seccionActiva === 'ventas' && <Ventas />}
    </div>
  </div>
);
}

export default App;