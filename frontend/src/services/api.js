// api.js - Funciones para comunicarse con el backend PHP

const API_URL = 'http://localhost/gestion-ventas/api';

export async function login(email, password) {
  const respuesta = await fetch(`${API_URL}/login.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // MUY importante: hace que se envíen/reciban las cookies de sesión
    body: JSON.stringify({ email, password }),
  });

  const datos = await respuesta.json();
  return datos;
}

export async function verificarSesion() {
  const respuesta = await fetch(`${API_URL}/verificar_sesion.php`, {
    method: 'GET',
    credentials: 'include',
  });

  const datos = await respuesta.json();
  return datos;
}

export async function logout() {
  const respuesta = await fetch(`${API_URL}/logout.php`, {
    method: 'GET',
    credentials: 'include',
  });

  const datos = await respuesta.json();
  return datos;
}

export async function listarProductos() {
  const respuesta = await fetch(`${API_URL}/listar_productos.php`, {
    method: 'GET',
    credentials: 'include',
  });

  const datos = await respuesta.json();
  return datos;
}
export async function crearProducto(producto) {
  const respuesta = await fetch(`${API_URL}/crear_producto.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(producto),
  });

  const datos = await respuesta.json();
  return datos;
}

export async function listarCategorias() {
  const respuesta = await fetch(`${API_URL}/listar_categorias.php`, {
    method: 'GET',
    credentials: 'include',
  });

  const datos = await respuesta.json();
  return datos;
}

export async function eliminarProducto(id) {
  const respuesta = await fetch(`${API_URL}/eliminar_producto.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ id }),
  });

  const datos = await respuesta.json();
  return datos;
}

export async function actualizarProducto(producto) {
  const respuesta = await fetch(`${API_URL}/actualizar_producto.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(producto),
  });

  const datos = await respuesta.json();
  return datos;
}

export async function listarClientes() {
  const respuesta = await fetch(`${API_URL}/listar_clientes.php`, {
    method: 'GET',
    credentials: 'include',
  });
  return await respuesta.json();
}

export async function crearCliente(cliente) {
  const respuesta = await fetch(`${API_URL}/crear_cliente.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(cliente),
  });
  return await respuesta.json();
}

export async function actualizarCliente(cliente) {
  const respuesta = await fetch(`${API_URL}/actualizar_cliente.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(cliente),
  });
  return await respuesta.json();
}

export async function eliminarCliente(id) {
  const respuesta = await fetch(`${API_URL}/eliminar_cliente.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id }),
  });
  return await respuesta.json();
}

export async function crearVenta(venta) {
  const respuesta = await fetch(`${API_URL}/crear_venta.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(venta),
  });
  return await respuesta.json();
}

export async function listarVentas() {
  const respuesta = await fetch(`${API_URL}/listar_ventas.php`, {
    method: 'GET',
    credentials: 'include',
  });
  return await respuesta.json();
}

export async function obtenerDashboard() {
  const respuesta = await fetch(`${API_URL}/dashboard.php`, {
    method: 'GET',
    credentials: 'include',
  });
  return await respuesta.json();

}

export async function cambiarPassword(contrasenaActual, contrasenaNueva) {
  try {
    const response = await fetch(`${API_URL}/cambiar_password.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        contrasena_actual: contrasenaActual,
        contrasena_nueva: contrasenaNueva,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { exito: false, mensaje: data.mensaje || 'Error desconocido' };
    }

    return { exito: true, mensaje: data.mensaje };
  } catch (error) {
    return { exito: false, mensaje: 'Error de conexión: ' + error.message };
  }
}