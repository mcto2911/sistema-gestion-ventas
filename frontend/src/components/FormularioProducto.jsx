import { useState, useEffect } from 'react';
import { crearProducto, actualizarProducto, listarCategorias } from '../services/api';

const FORMULARIO_VACIO = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  stock_minimo: '5',
  categoria_id: '',
};

function FormularioProducto({ productoAEditar, onGuardado, onCancelar }) {
  const [categorias, setCategorias] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const estaEditando = productoAEditar !== null;

  useEffect(() => {
    async function cargarCategorias() {
      const respuesta = await listarCategorias();
      if (respuesta.exito) {
        setCategorias(respuesta.datos);
      }
    }
    cargarCategorias();
  }, []);

  // Cada vez que "productoAEditar" cambia, precargamos el formulario con sus datos.
  // Si es null (modo crear), lo dejamos vacío.
  useEffect(() => {
    if (productoAEditar) {
      setFormulario({
        nombre: productoAEditar.nombre,
        descripcion: productoAEditar.descripcion || '',
        precio: productoAEditar.precio,
        stock: productoAEditar.stock,
        stock_minimo: productoAEditar.stock_minimo,
        categoria_id: productoAEditar.categoria_id,
      });
    } else {
      setFormulario(FORMULARIO_VACIO);
    }
  }, [productoAEditar]);

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
      // Le agregamos el "id" del producto original a los datos del formulario
      respuesta = await actualizarProducto({ ...formulario, id: productoAEditar.id });
    } else {
      respuesta = await crearProducto(formulario);
    }

    setEnviando(false);

    if (respuesta.exito) {
      setFormulario(FORMULARIO_VACIO);
      onGuardado(); // avisamos al padre que ya se guardó, sea creación o edición
    } else {
      setError(respuesta.mensaje || 'Error al guardar el producto');
    }
  }

 return (
  <div className="card mb-4">
    <div className="card-body">
      <h3 className="card-title mb-3">{estaEditando ? 'Editar producto' : 'Nuevo producto'}</h3>
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
          <label className="form-label">Descripción</label>
          <input
            type="text"
            className="form-control"
            name="descripcion"
            value={formulario.descripcion}
            onChange={manejarCambio}
          />
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Precio</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              name="precio"
              value={formulario.precio}
              onChange={manejarCambio}
              required
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Stock</label>
            <input
              type="number"
              className="form-control"
              name="stock"
              value={formulario.stock}
              onChange={manejarCambio}
              required
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Stock mínimo</label>
            <input
              type="number"
              className="form-control"
              name="stock_minimo"
              value={formulario.stock_minimo}
              onChange={manejarCambio}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Categoría</label>
          <select
            className="form-select"
            name="categoria_id"
            value={formulario.categoria_id}
            onChange={manejarCambio}
            required
          >
            <option value="">-- Selecciona una categoría --</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Guardando...' : estaEditando ? 'Actualizar producto' : 'Guardar producto'}
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

export default FormularioProducto;