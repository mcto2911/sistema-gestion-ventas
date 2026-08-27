import { useState, useEffect } from 'react';
import { listarClientes, eliminarCliente } from '../services/api';
import FormularioCliente from '../components/FormularioCliente';

function Clientes({ usuario }) {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const esAdmin = usuario.rol === 'administrador';
  const [clienteAEditar, setClienteAEditar] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  async function cargarClientes() {
    setCargando(true);
    const respuesta = await listarClientes();
    if (respuesta.exito) {
      setClientes(respuesta.datos);
    } else {
      setError('No se pudieron cargar los clientes');
    }
    setCargando(false);
  }

  useEffect(() => {
    cargarClientes();
  }, []);

  async function manejarEliminar(id, nombre) {
    const confirmado = window.confirm(`¿Seguro que quieres eliminar a "${nombre}"?`);
    if (!confirmado) return;

    const respuesta = await eliminarCliente(id);
    if (respuesta.exito) {
      cargarClientes();
    } else {
      alert(respuesta.mensaje || 'Error al eliminar el cliente');
    }
  }

  function manejarGuardado() {
    setClienteAEditar(null);
    cargarClientes();
  }

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ---- Datos para el panel lateral ----
  const totalClientes = clientes.length;
  const clientesIncompletos = clientes.filter((c) => !c.email || !c.telefono);
  const ultimoCliente = clientes.length > 0 ? clientes[clientes.length - 1] : null;

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2 className="mb-4">Clientes</h2>

      <div className="row align-items-start">
        {/* Columna izquierda: formulario */}
        <div className="col-lg-4 col-12 mb-4 columna-fija">
          <FormularioCliente
            clienteAEditar={clienteAEditar}
            onGuardado={manejarGuardado}
            onCancelar={() => setClienteAEditar(null)}
          />
        </div>

        {/* Columna central: catálogo de clientes */}
        <div className="col-lg-5 col-12 mb-4">
          <div className="card tarjeta-marca shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Catálogo de clientes</h5>

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              <div className="catalogo-scroll">
                {cargando ? (
                  <p>Cargando clientes...</p>
                ) : clientesFiltrados.length === 0 ? (
                  <p className="text-muted">No se encontraron clientes con esa búsqueda.</p>
                ) : (
                  clientesFiltrados.map((cliente) => (
                    <div className="card-producto" key={cliente.id}>
                      <div className="d-flex" style={{ gap: '12px' }}>
                        <div className="icono-producto">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, marginBottom: '4px' }}>{cliente.nombre}</p>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                            {cliente.email || 'Sin email registrado'}
                          </p>
                          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                            {cliente.telefono || 'Sin teléfono registrado'}
                          </p>
                          {cliente.direccion && (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>
                              📍 {cliente.direccion}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="d-flex mt-3" style={{ gap: '8px' }}>
                        <button className="btn-pill-editar" onClick={() => setClienteAEditar(cliente)}>
                          Editar
                        </button>
                        {esAdmin && (
                          <button className="btn-pill-eliminar" onClick={() => manejarEliminar(cliente.id, cliente.nombre)}>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: resumen */}
        <div className="col-lg-3 col-12 mb-4 columna-fija">
          <div className="panel-lateral mb-3">
            <h6 className="mb-3">Resumen de clientes</h6>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Total registrados</p>
            <p className="dato-numerico" style={{ fontSize: '1.6rem', margin: 0, fontWeight: 600 }}>{totalClientes}</p>
          </div>

          <div className="panel-lateral mb-3">
            <h6 style={{ color: 'var(--color-accent)' }}>Datos incompletos</h6>
            <p className="dato-numerico" style={{ fontSize: '1.6rem', fontWeight: 700, margin: '4px 0' }}>
              {clientesIncompletos.length}
            </p>
            {clientesIncompletos.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Todos tienen sus datos completos.</p>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Sin email o teléfono registrado
              </p>
            )}
          </div>

          {ultimoCliente && (
            <div className="panel-lateral">
              <h6>Último registrado</h6>
              <p style={{ fontWeight: 600, margin: '4px 0' }}>{ultimoCliente.nombre}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                {ultimoCliente.email || 'Sin email'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Clientes;