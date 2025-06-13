import React, { useState, useEffect } from 'react';
import '../../styles/PageStyles/GestionUsuarios.css';
import { eliminarUsuario, actualizarUsuario, crearUsuario } from '../../services/adminService'; // Importa las funciones desde adminServices
import { obtenerUsuariosYProveedores } from '../../services/authService'; // Importa la función para obtener usuarios y proveedores

function GestionUsuarios() {
  const [busqueda, setBusqueda] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // Estado para la confirmación de eliminación
  const [newUser, setNewUser] = useState({ nombre: '', correo: '', clave: '', role: 'user' }); // Estado para el nuevo usuario
  const [showCreateForm, setShowCreateForm] = useState(false); // Estado para mostrar el formulario de creación de usuario
  const token = localStorage.getItem('token'); // Suponiendo que el token se guarda en el localStorage

  // Función para obtener todos los usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        console.log('Obteniendo usuarios...');

        // Obtener usuarios desde el backend
        const data = await obtenerUsuariosYProveedores(token); // Llamada al backend
        console.log('Usuarios obtenidos:', data); // Ver datos obtenidos

        setUsuarios(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar los usuarios:', error);
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [token]);

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Manejar eliminación de usuario
  const handleEliminar = async (id) => {
    if (confirmDeleteId === id) {
      try {
        console.log('Eliminando usuario con ID:', id);

        // Eliminar usuario desde el backend
        await eliminarUsuario(id, token);
        setUsuarios(usuarios.filter((user) => user._id !== id)); // Filtrar el usuario eliminado de la lista

        console.log('Usuario eliminado correctamente');
        setConfirmDeleteId(null); // Resetear la confirmación
      } catch (error) {
        console.error('Error al eliminar usuario', error);
      }
    } else {
      // Mostrar el popup de confirmación
      setConfirmDeleteId(id);
    }
  };

  // Manejar edición de usuario
  const handleEditar = async (id) => {
    const updatedName = prompt("Nuevo nombre:", usuarios.find(user => user._id === id).nombre);
    const updatedEmail = prompt("Nuevo correo:", usuarios.find(user => user._id === id).correo);
    const updatedRole = usuarios.find(user => user._id === id).role; // No cambiar el role, pero lo enviamos igual

    if (updatedName && updatedEmail) {
      try {
        await actualizarUsuario(id, { nombre: updatedName, correo: updatedEmail, role: updatedRole }, token);
        setUsuarios(usuarios.map(user =>
          user._id === id ? { ...user, nombre: updatedName, correo: updatedEmail } : user
        ));
      } catch (error) {
        console.error('Error al editar usuario', error);
      }
    }
  };

  // Función para manejar el formulario de creación de usuario
  const handleCreateUser = async (e) => {
    e.preventDefault(); // Prevenir recarga de página al enviar formulario

    if (!newUser.nombre || !newUser.correo || !newUser.clave) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      // Llamada al backend para crear el usuario
      await crearUsuario(newUser, token);
      setUsuarios([...usuarios, { ...newUser, _id: Date.now() }]); // Añadir el nuevo usuario a la lista
      setShowCreateForm(false); // Cerrar el formulario
      setNewUser({ nombre: '', correo: '', clave: '', role: 'user' }); // Limpiar el formulario
    } catch (error) {
      console.error('Error al crear usuario:', error);
    }
  };

  return (
    <div className="gestion-container">
      <h2>Gestión de Usuarios</h2>

      <div className="acciones">
        <input
          type="text"
          placeholder="Buscar por nombre o correo"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="btn-crear" onClick={() => setShowCreateForm(!showCreateForm)}>
          ➕ Crear nuevo usuario
        </button>
      </div>

      {showCreateForm && (
        <div className="create-user-form">
          <form onSubmit={handleCreateUser}>
            <div className="mb-3">
              <label className="form-label">Nombre:</label>
              <input
                type="text"
                className="form-control"
                value={newUser.nombre}
                onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo:</label>
              <input
                type="email"
                className="form-control"
                value={newUser.correo}
                onChange={(e) => setNewUser({ ...newUser, correo: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Clave:</label>
              <input
                type="password"
                className="form-control"
                value={newUser.clave}
                onChange={(e) => setNewUser({ ...newUser, clave: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Rol:</label>
              <select
                className="form-select"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Crear Usuario</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>Cancelar</button>
          </form>
        </div>
      )}

      {loading ? (
        <div>Cargando usuarios...</div> // Indicador de carga mientras se obtienen los datos
      ) : (
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((user) => (
              <tr key={user._id}> {/* Cambié 'user.id' a 'user._id' ya que MongoDB usa '_id' */}
                <td>{user.nombre}</td>
                <td>{user.correo}</td>
                <td>{user.role}</td> {/* Se usa 'role' en lugar de 'tipo' */}
                <td>
                  <div className="acciones-botones">
                    <button
                      className="btn-editar"
                      onClick={() => handleEditar(user._id)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="btn-eliminar"
                      onClick={() => handleEliminar(user._id)}
                    >
                      🗑️ {confirmDeleteId === user._id ? 'Confirmar eliminación' : 'Eliminar'}
                    </button>
                    {confirmDeleteId === user._id && (
                      <span>¿Estás seguro?</span> // Mensaje de confirmación antes de eliminar
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GestionUsuarios;
