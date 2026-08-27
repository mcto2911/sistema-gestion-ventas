import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import { verificarSesion, logout } from './services/api';
import Ventas from './pages/Ventas';
import Dashboard from './pages/Dashboard';
import ModalCambiarPassword from './components/ModalCambiarPassword';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState('productos');
  const [modalCambiarPasswordVisible, setModalCambiarPasswordVisible] = useState(false);

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
      {<ModalCambiarPassword 
  visible={modalCambiarPasswordVisible} 
  onClose={() => setModalCambiarPasswordVisible(false)} 
/> }

      <nav
        className="d-flex justify-content-between align-items-center px-4 py-3"
        style={{ backgroundColor: 'var(--color-primary-dark)' }}
      >
        <span style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.4rem', fontWeight: 600 }}>
          Sistema de Ventas
        </span>
        <div className="d-flex align-items-center">
          <span style={{ color: '#EFE9D8', fontFamily: 'var(--font-body)', marginRight: '16px' }}>
            {usuario.nombre}{' '}
            <span
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-text)',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginLeft: '6px',
              }}
            >
              {usuario.rol}
            </span>
          </span>
          <button
  onClick={() => {
    console.log('Botón presionado');
    setModalCambiarPasswordVisible(true);
  }}
  style={{
    backgroundColor: 'transparent',
    border: '1px solid #EFE9D8',
    color: '#EFE9D8',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginRight: '8px',
  }}
>
  🔐 Cambiar contraseña
</button>
          <button
            onClick={manejarLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #EFE9D8',
              color: '#EFE9D8',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="container mt-4">
        <ul className="nav mb-4" style={{ gap: '8px' }}>
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'productos', label: 'Productos' },
            { id: 'clientes', label: 'Clientes' },
            { id: 'ventas', label: 'Ventas' },
          ].map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setSeccionActiva(item.id)}
                style={{
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  backgroundColor: seccionActiva === item.id ? 'var(--color-primary)' : 'transparent',
                  color: seccionActiva === item.id ? 'white' : 'var(--color-text)',
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {seccionActiva === 'dashboard' && <Dashboard />}
        {seccionActiva === 'productos' && <Productos usuario={usuario} />}
        {seccionActiva === 'clientes' && <Clientes usuario={usuario} />}
        {seccionActiva === 'ventas' && <Ventas />}
      </div>
    </div>
  );
}

export default App;