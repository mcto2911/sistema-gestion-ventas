import { useState, useEffect } from 'react';
import { crearCliente, actualizarCliente } from '../services/api';

const FORMULARIO_VACIO = {
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
};

function FormularioCliente({ clienteAEditar, onGuardado, onCancelar }) {
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const estaEditando = clienteAEditar !== null;

  useEffect(() => {
    if (clienteAEditar) {
      setFormulario({
        nombre: clienteAEditar.nombre,
        email: clienteAEditar.email || '',
        telefono: clienteAEditar.telefono || '',
        direccion: clienteAEditar.direccion || '',
      });
    } else {
      setFormulario(FORMULARIO_VACIO);
    }
  }, [clienteAEditar]);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setFormulario((valoresAnteriores) => ({
      ...valoresAnteriores,
      [name]: value,
    }));
  }

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setError('');
    setEnviando(true);

    let respuesta;
    if (estaEditando) {
      respuesta = await actualizarCliente({ ...formulario, id: clienteAEditar.id });
    } else {
      respuesta = await crearCliente(formulario);
    }

    setEnviando(false);

    if (respuesta.exito) {
      setFormulario(FORMULARIO_VACIO);
      onGuardado();
    } else {
      setError(respuesta.mensaje || 'Error al guardar el cliente');
    }
  }

  return (
    <div>
      <h3>{estaEditando ? 'Editar cliente' : 'Nuevo cliente'}</h3>
      <form onSubmit={manejarSubmit}>
        <div>
          <label>Nombre:</label>
          <input type="text" name="nombre" value={formulario.nombre} onChange={manejarCambio} required />
        </div>

        <div>
          <label>Email:</label>
          <input type="email" name="email" value={formulario.email} onChange={manejarCambio} />
        </div>

        <div>
          <label>Teléfono:</label>
          <input type="text" name="telefono" value={formulario.telefono} onChange={manejarCambio} />
        </div>

        <div>
          <label>Dirección:</label>
          <input type="text" name="direccion" value={formulario.direccion} onChange={manejarCambio} />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? 'Guardando...' : estaEditando ? 'Actualizar cliente' : 'Guardar cliente'}
        </button>

        {estaEditando && (
          <button type="button" onClick={onCancelar}>
            Cancelar edición
          </button>
        )}
      </form>
    </div>
  );
}

export default FormularioCliente;