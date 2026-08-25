import { useState, useEffect } from 'react';
import { listarProductos, eliminarProducto } from '../services/api';
import FormularioProducto from '../components/FormularioProducto';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [productoAEditar, setProductoAEditar] = useState(null); // null = modo "crear"

  async function cargarProductos() {
    setCargando(true);
    const respuesta = await listarProductos();

    if (respuesta.exito) {
      setProductos(respuesta.datos);
    } else {
      setError('No se pudieron cargar los productos');
    }
    setCargando(false);
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  async function manejarEliminar(id, nombre) {
    const confirmado = window.confirm(`¿Seguro que quieres eliminar "${nombre}"?`);
    if (!confirmado) return;

    const respuesta = await eliminarProducto(id);

    if (respuesta.exito) {
      cargarProductos();
    } else {
      alert(respuesta.mensaje || 'Error al eliminar el producto');
    }
  }

  function manejarGuardado() {
    setProductoAEditar(null); // salimos del modo edición (si estábamos en él)
    cargarProductos();
  }

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <FormularioProducto
        productoAEditar={productoAEditar}
        onGuardado={manejarGuardado}
        onCancelar={() => setProductoAEditar(null)}
      />

      <h2>Productos</h2>
      {cargando ? (
        <p>Cargando productos...</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.nombre}</td>
                <td>{producto.categoria_nombre}</td>
                <td>S/ {producto.precio}</td>
                <td style={{ color: Number(producto.stock) <= Number(producto.stock_minimo) ? 'red' : 'black' }}>
                  {producto.stock}
                </td>
                <td>
                  <button onClick={() => setProductoAEditar(producto)}>Editar</button>{' '}
                  <button onClick={() => manejarEliminar(producto.id, producto.nombre)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Productos;