import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import { verificarSesion, logout } from './services/api';

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
      <h1>Bienvenido, {usuario.nombre}</h1>
      <p>Rol: {usuario.rol}</p>
      <button onClick={manejarLogout}>Cerrar sesión</button>

      <hr />

      <nav>
        <button onClick={() => setSeccionActiva('productos')}>Productos</button>{' '}
        <button onClick={() => setSeccionActiva('clientes')}>Clientes</button>
      </nav>

      <hr />

      {seccionActiva === 'productos' && <Productos />}
      {seccionActiva === 'clientes' && <Clientes />}
    </div>
  );
}

export default App;