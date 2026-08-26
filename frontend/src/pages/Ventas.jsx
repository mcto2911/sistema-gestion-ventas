import { useState, useEffect } from 'react';
import { listarProductos, listarClientes, crearVenta, listarVentas } from '../services/api';

function Ventas() {
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]); // productos agregados a la venta actual
  const [historialVentas, setHistorialVentas] = useState([]);
  
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState('1');

  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [enviando, setEnviando] = useState(false);

useEffect(() => {
  async function cargarDatos() {
    const respProductos = await listarProductos();
    if (respProductos.exito) setProductosDisponibles(respProductos.datos);

    const respClientes = await listarClientes();
    if (respClientes.exito) setClientes(respClientes.datos);

    cargarHistorial();
  }
  cargarDatos();
}, []);

  function agregarAlCarrito() {
    setError('');

    if (!productoSeleccionado) {
      setError('Selecciona un producto');
      return;
    }

    const cantidadNum = Number(cantidad);
    if (cantidadNum <= 0) {
      setError('La cantidad debe ser mayor a cero');
      return;
    }

    const producto = productosDisponibles.find((p) => p.id === productoSeleccionado);

    // Si el producto ya está en el carrito, sumamos la cantidad en vez de duplicar la fila
    const yaExiste = carrito.find((item) => item.producto_id === productoSeleccionado);

    if (yaExiste) {
      setCarrito((carritoAnterior) =>
        carritoAnterior.map((item) =>
          item.producto_id === productoSeleccionado
            ? { ...item, cantidad: item.cantidad + cantidadNum }
            : item
        )
      );
    } else {
      setCarrito((carritoAnterior) => [
        ...carritoAnterior,
        {
          producto_id: productoSeleccionado,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          cantidad: cantidadNum,
        },
      ]);
    }

    // Limpiamos la selección para el siguiente producto
    setProductoSeleccionado('');
    setCantidad('1');
  }

  function quitarDelCarrito(producto_id) {
    setCarrito((carritoAnterior) => carritoAnterior.filter((item) => item.producto_id !== producto_id));
  }

  // Calculamos el total sumando cada línea del carrito (no viene de la API, se calcula aquí para mostrarlo al instante)
  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

  async function confirmarVenta() {
    setError('');
    setMensajeExito('');

    if (carrito.length === 0) {
      setError('Agrega al menos un producto a la venta');
      return;
    }

    setEnviando(true);

    const respuesta = await crearVenta({
      cliente_id: clienteSeleccionado || null,
      productos: carrito.map((item) => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
      })),
    });

    setEnviando(false);

    if (respuesta.exito) {
      setMensajeExito(`Venta registrada correctamente. Total: S/ ${respuesta.total}`);
      setCarrito([]);
      setClienteSeleccionado('');

      // Recargamos productos para reflejar el nuevo stock descontado
      const respProductos = await listarProductos();
      if (respProductos.exito) setProductosDisponibles(respProductos.datos);
    } else {
      setError(respuesta.mensaje || 'Error al registrar la venta');
    }
    cargarHistorial(); // para que la venta recién hecha aparezca en el historial sin recargar la página
  }

  async function cargarHistorial() {
  const respuesta = await listarVentas();
  if (respuesta.exito) {
    setHistorialVentas(respuesta.datos);
  }
}

 return (
  <div>
    <h2 className="mb-3">Nueva venta</h2>

    <div className="card mb-4">
      <div className="card-body">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Cliente (opcional)</label>
            <select
              className="form-select"
              value={clienteSeleccionado}
              onChange={(e) => setClienteSeleccionado(e.target.value)}
            >
              <option value="">-- Cliente ocasional --</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr />

        <h5>Agregar producto</h5>
        <div className="row align-items-end">
          <div className="col-md-6 mb-3">
            <label className="form-label">Producto</label>
            <select
              className="form-select"
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
            >
              <option value="">-- Selecciona un producto --</option>
              {productosDisponibles.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} (Stock: {producto.stock}) - S/ {producto.precio}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2 mb-3">
            <label className="form-label">Cantidad</label>
            <input
              type="number"
              min="1"
              className="form-control"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
          </div>

          <div className="col-md-2 mb-3">
            <button className="btn btn-primary w-100" onClick={agregarAlCarrito}>
              Agregar
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}
        {mensajeExito && <div className="alert alert-success py-2">{mensajeExito}</div>}

        <h5 className="mt-4">Carrito de venta</h5>
        {carrito.length === 0 ? (
          <p className="text-muted">Aún no has agregado productos.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio unitario</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {carrito.map((item) => (
                  <tr key={item.producto_id}>
                    <td>{item.nombre}</td>
                    <td>S/ {item.precio.toFixed(2)}</td>
                    <td>{item.cantidad}</td>
                    <td>S/ {(item.precio * item.cantidad).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => quitarDelCarrito(item.producto_id)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-3">
          <h4 className="mb-0">Total: S/ {total.toFixed(2)}</h4>
          <button className="btn btn-success btn-lg" onClick={confirmarVenta} disabled={enviando || carrito.length === 0}>
            {enviando ? 'Registrando venta...' : 'Confirmar venta'}
          </button>
        </div>
      </div>
    </div>

    <h3 className="mb-3">Historial de ventas</h3>
    {historialVentas.length === 0 ? (
      <p className="text-muted">Aún no hay ventas registradas.</p>
    ) : (
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th>Productos</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {historialVentas.map((venta) => (
              <tr key={venta.id}>
                <td>{venta.fecha}</td>
                <td>{venta.cliente_nombre || 'Cliente ocasional'}</td>
                <td>{venta.usuario_nombre}</td>
                <td>
                  <ul className="mb-0 ps-3">
                    {venta.detalle.map((d) => (
                      <li key={d.producto_id}>
                        {d.producto_nombre} x{d.cantidad} (S/ {d.subtotal})
                      </li>
                    ))}
                  </ul>
                </td>
                <td>S/ {venta.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
  
}

export default Ventas;