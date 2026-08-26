import { useState, useEffect } from 'react';
import { listarProductos, listarClientes, crearVenta, listarVentas } from '../services/api';

function Ventas() {
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
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

  async function cargarHistorial() {
    const respuesta = await listarVentas();
    if (respuesta.exito) {
      setHistorialVentas(respuesta.datos);
    }
  }

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

    setProductoSeleccionado('');
    setCantidad('1');
  }

  function quitarDelCarrito(producto_id) {
    setCarrito((carritoAnterior) => carritoAnterior.filter((item) => item.producto_id !== producto_id));
  }

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

      const respProductos = await listarProductos();
      if (respProductos.exito) setProductosDisponibles(respProductos.datos);
    } else {
      setError(respuesta.mensaje || 'Error al registrar la venta');
    }
    cargarHistorial();
  }

  // ---- Datos para el panel lateral ----
  const hoyISO = new Date().toISOString().slice(0, 10); // "2026-08-26"
  const ventasHoy = historialVentas.filter((v) => v.fecha.startsWith(hoyISO));
  const totalHoy = ventasHoy.reduce((suma, v) => suma + Number(v.total), 0);

  const totalGeneral = historialVentas.reduce((suma, v) => suma + Number(v.total), 0);
  const ticketPromedio = historialVentas.length > 0 ? totalGeneral / historialVentas.length : 0;

  // Agrupamos ventas por vendedor y sumamos su total, para encontrar quién vendió más
  const ventasPorVendedor = historialVentas.reduce((acumulador, v) => {
    const nombre = v.usuario_nombre;
    acumulador[nombre] = (acumulador[nombre] || 0) + Number(v.total);
    return acumulador;
  }, {});
  const mejorVendedor = Object.entries(ventasPorVendedor).sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <h2 className="mb-4">Ventas</h2>

      <div className="row align-items-start">
        {/* Columna izquierda: nueva venta */}
        <div className="col-lg-4 mb-4 columna-fija">
          <div className="card tarjeta-marca shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Nueva venta</h5>

              <div className="mb-3">
                <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cliente (opcional)</label>
                <select className="form-select" value={clienteSeleccionado} onChange={(e) => setClienteSeleccionado(e.target.value)}>
                  <option value="">-- Cliente ocasional --</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                  ))}
                </select>
              </div>

              <h6 className="mb-2">Agregar producto</h6>
              <div className="mb-2">
                <select className="form-select" value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)}>
                  <option value="">-- Selecciona un producto --</option>
                  {productosDisponibles.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre} (Stock: {producto.stock}) - S/ {producto.precio}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex mb-3" style={{ gap: '8px' }}>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  style={{ width: '80px' }}
                />
                <button className="btn-marca" style={{ flex: 1 }} onClick={agregarAlCarrito}>
                  Agregar
                </button>
              </div>

              {error && <div className="alert alert-danger py-2">{error}</div>}
              {mensajeExito && <div className="alert alert-success py-2">{mensajeExito}</div>}

              <h6 className="mb-2 mt-3">Carrito de venta</h6>
              {carrito.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Aún no has agregado productos.</p>
              ) : (
                <div>
                  {carrito.map((item) => (
                    <div key={item.producto_id} className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '0.9rem' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>{item.nombre}</p>
                        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                          {item.cantidad} x S/ {item.precio.toFixed(2)}
                        </p>
                      </div>
                      <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                        <span className="dato-numerico">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                        <button
                          onClick={() => quitarDelCarrito(item.producto_id)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '1.1rem', lineHeight: 1 }}
                          title="Quitar"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <hr />
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ fontWeight: 600 }}>Total</span>
                <span className="dato-numerico" style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>
                  S/ {total.toFixed(2)}
                </span>
              </div>

              <button className="btn-marca w-100" onClick={confirmarVenta} disabled={enviando || carrito.length === 0} style={{ padding: '10px' }}>
                {enviando ? 'Registrando venta...' : 'Confirmar venta'}
              </button>
            </div>
          </div>
        </div>

        {/* Columna central: historial */}
        <div className="col-lg-5 mb-4">
          <div className="card tarjeta-marca shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Historial de ventas</h5>

              <div className="catalogo-scroll">
                {historialVentas.length === 0 ? (
                  <p className="text-muted">Aún no hay ventas registradas.</p>
                ) : (
                  historialVentas.map((venta) => (
                    <div className="card-venta" key={venta.id}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{venta.fecha}</p>
                          <p style={{ margin: 0, fontWeight: 600 }}>{venta.cliente_nombre || 'Cliente ocasional'}</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Vendedor: {venta.usuario_nombre}
                          </p>
                        </div>
                        <span className="dato-numerico" style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                          S/ {venta.total}
                        </span>
                      </div>
                      <ul className="mb-0 ps-3" style={{ fontSize: '0.85rem' }}>
                        {venta.detalle.map((d) => (
                          <li key={d.producto_id}>
                            {d.producto_nombre} x{d.cantidad} (S/ {d.subtotal})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: resumen */}
        <div className="col-lg-3 mb-4 columna-fija">
          <div className="panel-lateral mb-3">
            <h6 className="mb-2">Ventas de hoy</h6>
            <p className="dato-numerico" style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, color: 'var(--color-primary-dark)' }}>
              S/ {totalHoy.toFixed(2)}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>{ventasHoy.length} venta(s)</p>
          </div>

          <div className="panel-lateral mb-3">
            <h6 className="mb-2">Mejor vendedor</h6>
            {mejorVendedor ? (
              <>
                <p style={{ fontWeight: 700, margin: 0 }}>{mejorVendedor[0]}</p>
                <p className="dato-numerico" style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  S/ {mejorVendedor[1].toFixed(2)} en ventas
                </p>
              </>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Aún no hay datos.</p>
            )}
          </div>

          <div className="panel-lateral">
            <h6 className="mb-2">Ticket promedio</h6>
            <p className="dato-numerico" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-accent)', margin: 0 }}>
              S/ {ticketPromedio.toFixed(2)}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Promedio por venta registrada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ventas;