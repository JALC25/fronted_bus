<template>
  <div class="container">
    <h1>Listado de Usuarios</h1>

    <!-- Buscador por ID -->
    <div class="search-container">
      <label for="busqueda">Buscar por ID:</label>
      <input id="busqueda" v-model="busquedaId" type="number" placeholder="Ingrese ID" />
      <button @click="buscarUsuario">Buscar</button>
      <button @click="cargarUsuarios">Mostrar Todos</button>
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
          <th>Contraseña</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="usuario in usuarios" :key="usuario.id_usuario">
          <td>{{ usuario.id_usuario }}</td>
          <td>{{ usuario.nombre }}</td>
          <td>{{ usuario.correo_electronico }}</td>
          <td>{{ usuario.telefono }}</td>
          <td>********</td> <!-- Oculta la contraseña -->
          <td>
            <button @click="editarUsuario(usuario)">Editar</button>
            <button @click="eliminarUsuario(usuario.id_usuario)">Eliminar</button>
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
      usuarioEditando: null,
      busquedaId: "",
      mostrarModalAgregar: false,
      nuevoUsuario: { nombre: "", correo_electronico: "", telefono: "", contraseña: "", id_rol: "2" },
    };
  },
  methods: {
    // Cargar usuarios al inicio
    async cargarUsuarios() {
      try {
        const response = await axios.get("http://localhost:3001/usuarios");
        this.usuarios = response.data;
      } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
      }
    },

    // Buscar usuario por ID
    async buscarUsuario() {
      if (!this.busquedaId) {
        alert("Ingrese un ID válido");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/usuarios/${this.busquedaId}`);
        this.usuarios = [response.data];
      } catch (error) {
        console.error("❌ Error al buscar usuario:", error);
        alert("Usuario no encontrado");
      }
    },

    // Agregar un usuario
    async agregarUsuario() {
      if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.correo_electronico || !this.nuevoUsuario.contraseña) {
        alert("Todos los campos son obligatorios");
        return;
      }
      try {
        await axios.post("http://localhost:3001/usuarios", this.nuevoUsuario);
        alert("Usuario agregado correctamente");
        this.mostrarModalAgregar = false;
        this.cargarUsuarios();
      } catch (error) {
        console.error("❌ Error al agregar usuario:", error);
        alert("Error al agregar usuario.");
      }
    },

    // Editar usuario
    editarUsuario(usuario) {
      this.usuarioEditando = { ...usuario, contraseña: "" }; // Nueva contraseña opcional
    },

    // Guardar edición de usuario
    async guardarEdicion() {
      try {
        const datosActualizados = { ...this.usuarioEditando };

        // Si la contraseña está vacía, no enviarla
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

    // Eliminar usuario
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
.search-container input {
  width: 150px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Botón Agregar */
.btn-add {
  background: #28a745;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
  text-align: center;
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
  text-align: center;
}
</style>