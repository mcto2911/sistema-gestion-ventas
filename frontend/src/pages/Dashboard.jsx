import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { obtenerDashboard } from '../services/api';

function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargar() {
      const respuesta = await obtenerDashboard();
      if (respuesta.exito) {
        setDatos(respuesta.datos);
      } else {
        setError('No se pudo cargar el dashboard');
      }
      setCargando(false);
    }
    cargar();
  }, []);

  if (cargando) return <p>Cargando dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>

      {/* Tarjetas resumen */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card tarjeta-marca shadow-sm h-100">
            <div className="card-body">
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Ventas de hoy
              </p>
              <p className="dato-numerico" style={{ fontSize: '1.8rem', margin: 0, color: 'var(--color-primary-dark)' }}>
                S/ {Number(datos.ventas_hoy.total).toFixed(2)}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{datos.ventas_hoy.cantidad} venta(s)</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card tarjeta-marca shadow-sm h-100">
            <div className="card-body">
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Ventas del mes
              </p>
              <p className="dato-numerico" style={{ fontSize: '1.8rem', margin: 0, color: 'var(--color-primary-dark)' }}>
                S/ {Number(datos.ventas_mes.total).toFixed(2)}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{datos.ventas_mes.cantidad} venta(s)</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card tarjeta-marca shadow-sm h-100">
            <div className="card-body">
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Total de clientes
              </p>
              <p className="dato-numerico" style={{ fontSize: '1.8rem', margin: 0, color: 'var(--color-primary-dark)' }}>
                {datos.total_clientes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de ventas mensuales */}
      <div className="card tarjeta-marca shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">Resumen de ventas (últimos 6 meses)</h5>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={datos.ventas_por_mes}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B6B47" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#5B6B47" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes_nombre" stroke="#7A7264" />
              <YAxis stroke="#7A7264" />
              <Tooltip
                formatter={(value) => [`S/ ${Number(value).toFixed(2)}`, 'Ventas']}
                contentStyle={{ fontFamily: 'Inter', borderRadius: '8px', border: '1px solid #E4DDC9' }}
              />
              <Area type="monotone" dataKey="total" stroke="#5B6B47" strokeWidth={2} fill="url(#colorVentas)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="row">
        {/* Alerta de stock bajo */}
        <div className="col-md-5 mb-4">
          <div
            className="shadow-sm h-100"
            style={{
              backgroundColor: '#F7E4C4',
              border: '1px solid #E0BE85',
              borderRadius: '10px',
              padding: '20px',
            }}
          >
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>⚠️ Productos con stock bajo</h5>
            {datos.stock_bajo.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No hay productos con stock bajo. Todo en orden.</p>
            ) : (
              <ul className="mb-0 ps-3">
                {datos.stock_bajo.map((producto) => (
                  <li key={producto.id} style={{ marginBottom: '4px' }}>
                    <strong>{producto.nombre}</strong> — quedan {producto.stock} (mínimo {producto.stock_minimo})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="col-md-7 mb-4">
          <div className="card tarjeta-marca shadow-sm h-100">
            <div className="card-body">
              <h5 className="mb-3">🏆 Productos más vendidos</h5>
              {datos.mas_vendidos.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Aún no hay ventas registradas.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th>Producto</th>
                        <th>Vendidos</th>
                        <th>Stock actual</th>
                        <th>Categoría</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.mas_vendidos.map((producto) => (
                        <tr key={producto.id}>
                          <td>{producto.nombre}</td>
                          <td className="dato-numerico">{producto.total_vendido}</td>
                          <td className="dato-numerico">{producto.stock}</td>
                          <td>
                            <span
                              style={{
                                backgroundColor: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '10px',
                                padding: '2px 10px',
                                fontSize: '0.78rem',
                              }}
                            >
                              {producto.categoria_nombre}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;