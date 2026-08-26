import { useState, useEffect } from 'react';
import { listarClientes, eliminarCliente } from '../services/api';
import FormularioCliente from '../components/FormularioCliente';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [clienteAEditar, setClienteAEditar] = useState(null);

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

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
   <div className="table-responsive">
  <table className="table table-striped table-hover align-middle">
    <thead className="table-dark">
      <tr>
        <th>Nombre</th>
        <th>Email</th>
        <th>Teléfono</th>
        <th>Dirección</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {clientes.map((cliente) => (
        <tr key={cliente.id}>
          <td>{cliente.nombre}</td>
          <td>{cliente.email || '-'}</td>
          <td>{cliente.telefono || '-'}</td>
          <td>{cliente.direccion || '-'}</td>
          <td>
            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setClienteAEditar(cliente)}>
              Editar
            </button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => manejarEliminar(cliente.id, cliente.nombre)}>
              Eliminar
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  );
}

export default Clientes;