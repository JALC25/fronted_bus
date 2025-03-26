<template>
  <div class="container">
    <h1>Listado de Usuarios</h1>

    <!-- Buscador por ID -->
    <div class="search-container">
      <label for="busqueda">Buscar por ID:</label>
      <input id="busqueda" v-model="busquedaId" type="number" placeholder="Ingrese ID" />
      <button @click="buscarUsuario">Buscar</button>
      <button @click="cargarUsuarios">Mostrar Todos</button>
      <button @click="mostrar5Usuarios">Mostrar 5</button>
    </div>

    <!-- Botón Agregar Usuario -->
    <button class="btn-add" @click="mostrarModalAgregar = true">Agregar Usuario</button>

    <!-- Tabla -->
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Teléfono</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usuario in usuariosMostrados" :key="usuario.id_usuario">
          <td>{{ usuario.id_usuario }}</td>
          <td>{{ usuario.nombre }}</td>
          <td>{{ usuario.correo_electronico }}</td>
          <td>{{ usuario.telefono }}</td>
          <td>{{ usuario.id_rol === 1 ? 'Administrador' : 'Usuario' }}</td>
          <td class="vertical-actions">
            <button class="btn-edit" @click="editarUsuario(usuario)">Editar</button>
            <button class="btn-delete" @click="eliminarUsuario(usuario.id_usuario)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Agregar Usuario -->
    <div v-if="mostrarModalAgregar" class="modal">
      <div class="modal-content">
        <h2>Agregar Usuario</h2>
        <input v-model="nuevoUsuario.nombre" type="text" placeholder="Nombre" />
        <input v-model="nuevoUsuario.correo_electronico" type="email" placeholder="Correo" />
        <input v-model="nuevoUsuario.telefono" type="text" placeholder="Teléfono" />
        <input v-model="nuevoUsuario.contraseña" type="password" placeholder="Contraseña" />
        <select v-model="nuevoUsuario.id_rol">
          <option value="1">Administrador</option>
          <option value="2">Usuario</option>
        </select>
        <button @click="agregarUsuario">Guardar</button>
        <button @click="mostrarModalAgregar = false">Cancelar</button>
      </div>
    </div>

    <!-- Modal Editar Usuario -->
    <div v-if="usuarioEditando" class="modal">
      <div class="modal-content">
        <h2>Editar Usuario</h2>
        <input v-model="usuarioEditando.nombre" type="text" placeholder="Nombre" />
        <input v-model="usuarioEditando.correo_electronico" type="email" placeholder="Correo" />
        <input v-model="usuarioEditando.telefono" type="text" placeholder="Teléfono" />
        <input v-model="usuarioEditando.contraseña" type="password" placeholder="Nueva Contraseña (Opcional)" />
        <select v-model="usuarioEditando.id_rol">
          <option value="1">Administrador</option>
          <option value="2">Usuario</option>
        </select>
        <button @click="guardarEdicion">Guardar Cambios</button>
        <button @click="usuarioEditando = null">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      usuarios: [],
      usuariosMostrados: [],
      busquedaId: "",
      mostrarModalAgregar: false,
      nuevoUsuario: { 
        nombre: "", 
        correo_electronico: "", 
        telefono: "", 
        contraseña: "", 
        id_rol: "2" 
      },
      usuarioEditando: null
    };
  },
  methods: {
    async cargarUsuarios() {
      try {
        const response = await axios.get("http://localhost:3001/usuarios");
        // Ordenar por ID descendente para que los más nuevos aparezcan primero
        this.usuarios = response.data.sort((a, b) => b.id_usuario - a.id_usuario);
        this.usuariosMostrados = [...this.usuarios];
      } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
      }
    },
    
    mostrar5Usuarios() {
      this.usuariosMostrados = this.usuarios.slice(0, 5);
    },
    
    async buscarUsuario() {
      if (!this.busquedaId) {
        alert("Ingrese un ID válido");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/usuarios/${this.busquedaId}`);
        this.usuariosMostrados = [response.data];
      } catch (error) {
        console.error("❌ Error al buscar usuario:", error);
        alert("Usuario no encontrado");
      }
    },
    
    async agregarUsuario() {
      if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.correo_electronico || !this.nuevoUsuario.contraseña) {
        alert("Todos los campos son obligatorios");
        return;
      }
      try {
        const response = await axios.post("http://localhost:3001/usuarios", this.nuevoUsuario);
        alert("Usuario agregado correctamente");
        this.mostrarModalAgregar = false;
        
        // Agregar el nuevo usuario al principio del array
        this.usuarios.unshift(response.data);
        this.usuariosMostrados = [...this.usuarios];
        
        // Resetear el formulario
        this.nuevoUsuario = { 
          nombre: "", 
          correo_electronico: "", 
          telefono: "", 
          contraseña: "", 
          id_rol: "2" 
        };
      } catch (error) {
        console.error("❌ Error al agregar usuario:", error);
        alert("Error al agregar usuario.");
      }
    },
    
    editarUsuario(usuario) {
      this.usuarioEditando = { ...usuario, contraseña: "" };
    },
    
    async guardarEdicion() {
      try {
        const datosActualizados = { ...this.usuarioEditando };
        if (!datosActualizados.contraseña) {
          delete datosActualizados.contraseña;
        }
        await axios.put(`http://localhost:3001/usuarios/${this.usuarioEditando.id_usuario}`, datosActualizados);
        alert("Usuario actualizado correctamente");
        this.usuarioEditando = null;
        this.cargarUsuarios();
      } catch (error) {
        console.error("❌ Error al actualizar usuario:", error);
        alert("Error al actualizar usuario.");
      }
    },
    
    async eliminarUsuario(id) {
      if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
      try {
        await axios.delete(`http://localhost:3001/usuarios/${id}`);
        alert("Usuario eliminado correctamente");
        this.cargarUsuarios();
      } catch (error) {
        console.error("❌ Error al eliminar usuario:", error);
        alert("Error al eliminar usuario.");
      }
    }
  },
  mounted() {
    this.cargarUsuarios();
  }
};
</script>

<style>
/* Estilos Generales */
.container {
  max-width: 900px;
  margin: auto;
  font-family: Arial, sans-serif;
}
h1 {
  text-align: center;
  color: #333;
}

/* Buscador */
.search-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.search-container label {
  font-weight: 500;
}
.search-container input {
  width: 150px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.search-container button {
  padding: 5px 10px;
  border: 1px solid #1e40af;
  border-radius: 4px;
  background: white;
  color: #1e40af;
  cursor: pointer;
}
.search-container button:hover {
  background: #1e40af;
  color: white;
}

/* Botón Agregar */
.btn-add {
  background: #1e40af;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}
.btn-add:hover {
  background: #1e3a8a;
}

/* Tabla */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f1f5f9;
  color: #1e40af;
}

/* Acciones verticales */
.vertical-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.vertical-actions button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.vertical-actions button:first-child {
  background: #ffc107;
  color: white;
}
.vertical-actions button:first-child:hover {
  background: #2563eb;
}
.vertical-actions button:last-child {
  background: #ef4444;
  color: white;
}
.vertical-actions button:last-child:hover {
  background: #dc2626;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}
.modal-content h2 {
  color: #1e40af;
  margin-top: 0;
}
.modal-content input,
.modal-content select {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.modal-content button {
  padding: 8px 15px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.modal-content button:first-child {
  background: #e2e8f0;
  color: #333;
}
.modal-content button:last-child {
  background: #1e40af;
  color: white;
}
</style>