import { useState, useEffect } from 'react';
import { listarProductos, eliminarProducto, listarCategorias } from '../services/api';
import FormularioProducto from '../components/FormularioProducto';

function Productos({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const esAdmin = usuario.rol === 'administrador';
  const [productoAEditar, setProductoAEditar] = useState(null);

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

  async function cargarCategorias() {
    const respuesta = await listarCategorias();
    if (respuesta.exito) setCategorias(respuesta.datos);
  }

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
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

  const productosFiltrados = productos.filter((producto) => {
    const coincideNombre = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaFiltro === '' || producto.categoria_id === categoriaFiltro;
    return coincideNombre && coincideCategoria;
  });

  // ---- Datos para el panel lateral (calculados sobre TODOS los productos, no solo los filtrados) ----
  const totalProductos = productos.length;
  const totalCategorias = categorias.length;
  const productosStockBajo = productos.filter((p) => Number(p.stock) <= Number(p.stock_minimo));
  const valorInventario = productos.reduce((suma, p) => suma + Number(p.precio) * Number(p.stock), 0);

  // Calcula qué tan "llena" se ve la barra de stock de un producto.
  // No tenemos una "capacidad máxima" real en la base de datos, así que usamos
  // el stock mínimo como referencia: consideramos "barra llena" cuando el stock
  // es 4 veces el mínimo o más. Es una aproximación visual, no una métrica exacta.
  function calcularNivelStock(producto) {
    const stock = Number(producto.stock);
    const minimo = Number(producto.stock_minimo);
    const porcentaje = Math.min(100, (stock / (minimo * 4)) * 100);

    let color = 'var(--color-primary)'; // nivel saludable
    if (stock <= minimo) {
      color = 'var(--color-danger)'; // crítico
    } else if (stock <= minimo * 2) {
      color = 'var(--color-accent)'; // atención
    }

    return { porcentaje, color };
  }

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2 className="mb-4">Productos</h2>

      <div className="row align-items-start">
  {/* Columna izquierda: formulario */}
   <div className="col-lg-4 col-12 mb-4 columna-fija">
    <FormularioProducto
      productoAEditar={productoAEditar}
      onGuardado={manejarGuardado}
      onCancelar={() => setProductoAEditar(null)}
    />
  </div>

  {/* Columna central: catálogo */}
   <div className="col-lg-5 col-12 mb-4">
    <div className="card tarjeta-marca shadow-sm">
      <div className="card-body">
        <h5 className="mb-3">Catálogo de productos</h5>

        <div className="row mb-3">
          <div className="col-7">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="col-5">
            <select
              className="form-select"
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
            >
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="catalogo-scroll">
          {cargando ? (
            <p>Cargando productos...</p>
          ) : productosFiltrados.length === 0 ? (
            <p className="text-muted">No se encontraron productos con esos filtros.</p>
          ) : (
            productosFiltrados.map((producto) => {
              const nivel = calcularNivelStock(producto);
              return (
                <div className="card-producto" key={producto.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex" style={{ gap: '12px' }}>
                      <div className="icono-producto">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 8l-9-5-9 5 9 5 9-5z" />
                          <path d="M3 8v8l9 5 9-5V8" />
                          <path d="M12 13v8" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, marginBottom: '2px' }}>{producto.nombre}</p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                          Categoría: {producto.categoria_nombre}
                        </p>
                      </div>
                    </div>
                    <p className="dato-numerico" style={{ fontWeight: 600, color: 'var(--color-primary-dark)', whiteSpace: 'nowrap' }}>
                      S/ {producto.precio}
                    </p>
                  </div>

                  <div className="d-flex justify-content-between mt-2" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    <span>Stock</span>
                    <span className="dato-numerico">{producto.stock}</span>
                  </div>
                  <div className="barra-stock-track">
                    <div className="barra-stock-fill" style={{ width: `${nivel.porcentaje}%`, backgroundColor: nivel.color }}></div>
                  </div>

                  <div className="d-flex mt-3" style={{ gap: '8px' }}>
                    <button className="btn-pill-editar" onClick={() => setProductoAEditar(producto)}>
                      Editar
                    </button>
                    {esAdmin && (
                      <button className="btn-pill-eliminar" onClick={() => manejarEliminar(producto.id, producto.nombre)}>
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  </div>

  {/* Columna derecha: resumen de inventario */}
  <div className="col-lg-3 col-12 mb-4 columna-fija">
    <div className="panel-lateral mb-3">
      <h6 className="mb-3">Resumen de inventario</h6>
      <div className="d-flex" style={{ gap: '10px' }}>
        <div className="mini-stat">
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Productos</p>
          <p className="dato-numerico" style={{ fontSize: '1.3rem', margin: 0, fontWeight: 600 }}>{totalProductos}</p>
        </div>
        <div className="mini-stat">
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Categorías</p>
          <p className="dato-numerico" style={{ fontSize: '1.3rem', margin: 0, fontWeight: 600 }}>{totalCategorias}</p>
        </div>
      </div>
    </div>

    <div className="panel-lateral mb-3">
      <h6 style={{ color: 'var(--color-danger)' }}>Alertas de stock bajo</h6>
      <p className="dato-numerico" style={{ fontSize: '1.6rem', fontWeight: 700, margin: '4px 0' }}>
        {productosStockBajo.length}
      </p>
      {productosStockBajo.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Todo en orden.</p>
      ) : (
        <ul className="ps-3 mb-0" style={{ fontSize: '0.85rem' }}>
          {productosStockBajo.slice(0, 5).map((p) => (
            <li key={p.id}>{p.nombre}</li>
          ))}
        </ul>
      )}
    </div>

    <div className="panel-lateral">
      <h6>Valor de inventario</h6>
      <p className="dato-numerico" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: '4px 0' }}>
        S/ {valorInventario.toFixed(2)}
      </p>
      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
        Basado en precio × stock de cada producto
      </p>
    </div>
  </div>
</div>
    </div>
  );
}

export default Productos;