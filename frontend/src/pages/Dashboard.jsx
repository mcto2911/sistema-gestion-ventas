import { useState, useEffect } from 'react';
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
      <h2>Dashboard</h2>

      {/* Tarjetas resumen */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ border: '1px solid #ccc', padding: '16px', minWidth: '180px' }}>
          <h4>Ventas de hoy</h4>
          <p style={{ fontSize: '24px', margin: '4px 0' }}>S/ {Number(datos.ventas_hoy.total).toFixed(2)}</p>
          <p>{datos.ventas_hoy.cantidad} venta(s)</p>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '16px', minWidth: '180px' }}>
          <h4>Ventas del mes</h4>
          <p style={{ fontSize: '24px', margin: '4px 0' }}>S/ {Number(datos.ventas_mes.total).toFixed(2)}</p>
          <p>{datos.ventas_mes.cantidad} venta(s)</p>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '16px', minWidth: '180px' }}>
          <h4>Total de clientes</h4>
          <p style={{ fontSize: '24px', margin: '4px 0' }}>{datos.total_clientes}</p>
        </div>
      </div>

      <hr />

      {/* Alertas de stock bajo */}
      <h3>⚠️ Productos con stock bajo</h3>
      {datos.stock_bajo.length === 0 ? (
        <p>No hay productos con stock bajo. Todo en orden.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Stock actual</th>
              <th>Stock mínimo</th>
            </tr>
          </thead>
          <tbody>
            {datos.stock_bajo.map((producto) => (
              <tr key={producto.id} style={{ color: 'red' }}>
                <td>{producto.nombre}</td>
                <td>{producto.stock}</td>
                <td>{producto.stock_minimo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      {/* Productos más vendidos */}
      <h3>🏆 Productos más vendidos</h3>
      {datos.mas_vendidos.length === 0 ? (
        <p>Aún no hay ventas registradas.</p>
      ) : (
        <ol>
          {datos.mas_vendidos.map((producto) => (
            <li key={producto.id}>
              {producto.nombre} — {producto.total_vendido} unidades vendidas
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default Dashboard;