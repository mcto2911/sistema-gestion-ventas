import { useState, useEffect } from 'react';
import { listarProductos, eliminarProducto, listarCategorias } from '../services/api'; // NUEVO: listarCategorias
import FormularioProducto from '../components/FormularioProducto';

function Productos({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]); // NUEVO
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const esAdmin = usuario.rol === 'administrador';
  const [productoAEditar, setProductoAEditar] = useState(null);

  // NUEVO: estados para búsqueda y filtro
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

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

  // NUEVO: cargar categorías para el <select> de filtro
  async function cargarCategorias() {
    const respuesta = await listarCategorias();
    if (respuesta.exito) {
      setCategorias(respuesta.datos);
    }
  }

  useEffect(() => {
    cargarProductos();
    cargarCategorias(); // NUEVO
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
    setProductoAEditar(null);
    cargarProductos();
  }

  // NUEVO: filtramos la lista de productos según lo que el usuario escribió/seleccionó,
  // SIN pedirle nada nuevo al backend, ya que los datos ya están cargados en memoria.
  const productosFiltrados = productos.filter((producto) => {
    const coincideNombre = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === '' || producto.categoria_id === categoriaFiltro;
    return coincideNombre && coincideCategoria;
  });

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <FormularioProducto
        productoAEditar={productoAEditar}
        onGuardado={manejarGuardado}
        onCancelar={() => setProductoAEditar(null)}
      />

      <h2 className="mb-3">Productos</h2>

      {/* NUEVO: buscador y filtro */}
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-2">
          <select
            className="form-select"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">-- Todas las categorías --</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {cargando ? (
        <p>Cargando productos...</p>
      ) : (
        <>
          {productosFiltrados.length === 0 ? (
            <p className="text-muted">No se encontraron productos con esos filtros.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((producto) => (
                    <tr key={producto.id}>
                      <td>{producto.nombre}</td>
                      <td>{producto.categoria_nombre}</td>
                      <td>S/ {producto.precio}</td>
                      <td>
                        <span className={Number(producto.stock) <= Number(producto.stock_minimo) ? 'badge bg-danger' : 'badge bg-success'}>
                          {producto.stock}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setProductoAEditar(producto)}>
                          Editar
                        </button>
                        {esAdmin && (
                          <button className="btn btn-sm btn-outline-danger" onClick={() => manejarEliminar(producto.id, producto.nombre)}>
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Productos;