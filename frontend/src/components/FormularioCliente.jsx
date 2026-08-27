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
  <div className="card tarjeta-marca mb-4">
    <div className="card-body">
      <h3 className="card-title mb-3">{estaEditando ? 'Editar cliente' : 'Nuevo cliente'}</h3>
      <form onSubmit={manejarSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            name="nombre"
            value={formulario.nombre}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formulario.email}
            onChange={manejarCambio}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input
            type="text"
            className="form-control"
            name="telefono"
            value={formulario.telefono}
            onChange={manejarCambio}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Dirección</label>
          <input
            type="text"
            className="form-control"
            name="direccion"
            value={formulario.direccion}
            onChange={manejarCambio}
          />
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button type="submit" className="btn-marca w-100" disabled={enviando}>
          {enviando ? 'Guardando...' : estaEditando ? 'Actualizar cliente' : 'Guardar cliente'}
        </button>

        {estaEditando && (
          <button type="button" className="btn btn-secondary ms-2" onClick={onCancelar}>
            Cancelar edición
          </button>
        )}
      </form>
    </div>
  </div>
);
}

export default FormularioCliente;