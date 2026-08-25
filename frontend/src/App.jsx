import { useState, useEffect } from 'react';
import Login from './pages/Login';
import { verificarSesion, logout } from './services/api';
import Productos from './pages/Productos';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // useEffect: se ejecuta al cargar el componente por primera vez.
  // Aquí revisamos si ya había una sesión activa (por si recargas la página).
  useEffect(() => {
    async function checarSesion() {
      const respuesta = await verificarSesion();
      if (respuesta.autenticado) {
        setUsuario(respuesta.usuario);
      }
      setCargandoSesion(false);
    }
    checarSesion();
  }, []); // el array vacío [] significa: "ejecuta esto solo UNA VEZ"

  async function manejarLogout() {
    await logout();
    setUsuario(null);
  }

  if (cargandoSesion) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      {usuario ? (
  <div>
    <h1>Bienvenido, {usuario.nombre}</h1>
    <p>Rol: {usuario.rol}</p>
    <button onClick={manejarLogout}>Cerrar sesión</button>
    <hr />
    <Productos />
  </div>
) : (
  <Login onLoginExitoso={(datosUsuario) => setUsuario(datosUsuario)} />
)}
    </div>
  );
}

export default App;