<template>
  <div class="user-component">
    <!-- Vista de listado -->
    <div v-if="currentView === 'list'">
      <div class="header">
        <h2>Listado de Registros de Usuarios</h2>
        <!-- Botón Agregar ubicado fuera de la tabla -->
        <button class="btn btn-add" @click="goToCreate">Agregar Usuario</button>
      </div>
      <!-- Buscador (solo por Nombre) -->
      <div class="search-box">
        <label for="search">Buscar por Nombre:</label>
        <input type="text" id="search" v-model="searchQuery" placeholder="Ingrese nombre" />
      </div>
      <!-- Control para elegir cuántos registros mostrar -->
      <div class="records-control">
        <label for="recordsSelect">Mostrar registros:</label>
        <select id="recordsSelect" v-model="recordsToShow">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="todos">Todos</option>
        </select>
      </div>
      <table class="user-table">
        <thead>
          <tr>
            <th>N°</th>
            <th>ID</th>
            <th>Rol</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Contraseña</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in displayedUsers" :key="user.id">
            <td>{{ index + 1 }}</td>
            <td>{{ user.id }}</td>
            <td>{{ user.rol === "1" ? "Administrador" : "Usuario" }}</td>
            <td>{{ user.nombre }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.contraseña }}</td>
            <td>{{ user.telefono }}</td>
            <td class="actions">
              <button class="btn btn-edit" @click="goToEdit(index)">Editar</button>
              <button class="btn btn-delete" @click="confirmDelete(index)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vista de formulario para crear/editar -->
    <div v-else-if="currentView === 'create'" class="form-view">
      <h2>{{ editIndex !== null ? "Editar Usuario" : "Crear Usuario" }}</h2>
      <form @submit.prevent="saveUser" class="user-form">
        <div class="form-group">
          <label for="id">ID:</label>
          <input type="text" id="id" v-model="currentUser.id" placeholder="Ingrese el ID" class="small-input" />
        </div>
        <div class="form-group">
          <label for="rol">Rol:</label>
          <select id="rol" v-model="currentUser.rol" class="small-input">
            <option value="1">Administrador</option>
            <option value="2">Usuario</option>
          </select>
        </div>
        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input type="text" id="nombre" v-model="currentUser.nombre" placeholder="Ingrese el nombre" class="small-input" />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="currentUser.email" placeholder="Ingrese el email" class="small-input" />
        </div>
        <div class="form-group">
          <label for="contraseña">Contraseña:</label>
          <input type="password" id="contraseña" v-model="currentUser.contraseña" placeholder="Ingrese la contraseña" class="small-input" />
        </div>
        <div class="form-group">
          <label for="telefono">Teléfono:</label>
          <input type="text" id="telefono" v-model="currentUser.telefono" placeholder="Ingrese el teléfono (8 dígitos)" class="small-input" maxlength="8" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-save">{{ editIndex !== null ? "Actualizar" : "Guardar" }}</button>
          <button type="button" class="btn btn-cancel" @click="goToList">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- Modal de Error -->
    <div v-if="showErrorModal" class="modal-overlay">
      <div class="modal">
        <p>{{ errorMessage }}</p>
        <button @click="showErrorModal = false" class="btn btn-close">Cerrar</button>
      </div>
    </div>

    <!-- Modal de Éxito -->
    <div v-if="showSuccessModal" class="modal-success">
      <p>{{ successMessage }}</p>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <p>¿Está seguro que desea eliminar el usuario?</p>
        <div class="modal-actions">
          <button @click="deleteUser" class="btn btn-confirm">Sí</button>
          <button @click="cancelDelete" class="btn btn-cancel">No</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserComponent",
  data() {
    return {
      currentView: "list", // 'list' o 'create'
      users: [],
      recordsToShow: "5", // '5', '10' o 'todos'
      searchQuery: "",
      showErrorModal: false,
      errorMessage: "",
      showSuccessModal: false,
      successMessage: "",
      showDeleteModal: false,
      deleteIndex: null,
      // Usuario actual para crear o editar
      currentUser: {
        id: "",
        rol: "2",
        nombre: "",
        email: "",
        contraseña: "",
        telefono: ""
      },
      editIndex: null
    };
  },
  computed: {
    // Filtra los usuarios únicamente por el campo Nombre
    filteredUsers() {
      if (!this.searchQuery.trim()) return this.users;
      const query = this.searchQuery.toLowerCase();
      return this.users.filter(user =>
        user.nombre.toLowerCase().includes(query)
      );
    },
    displayedUsers() {
      if (this.recordsToShow === "todos") {
        return this.filteredUsers;
      } else {
        return this.filteredUsers.slice(0, Number(this.recordsToShow));
      }
    }
  },
  created() {
    // Cargar usuarios desde localStorage para persistencia entre vistas
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
  },
  methods: {
    // Validación de email que comprueba la existencia de "@" y un punto en el dominio,
    // y que contenga al menos un número.
    isEmailValid(email) {
      if (!email.includes('@')) return false;
      const parts = email.split('@');
      if (parts.length !== 2 || !parts[1].includes('.')) return false;
      if (!/\d/.test(email)) return false;
      return true;
    },
    // Verifica que un valor sea numérico
    isNumeric(value) {
      return !isNaN(value);
    },
    // Guarda (crea o actualiza) el usuario tras validar los campos
    saveUser() {
      let missingFields = [];
      if (!this.currentUser.id) missingFields.push("ID");
      if (!this.currentUser.rol) missingFields.push("Rol");
      if (!this.currentUser.nombre) missingFields.push("Nombre");
      if (!this.currentUser.email) missingFields.push("Email");
      if (!this.currentUser.contraseña) missingFields.push("Contraseña");
      if (!this.currentUser.telefono) missingFields.push("Teléfono");

      if (missingFields.length > 0) {
        this.errorMessage = "Falta completar el/los siguiente(s) campo(s): " + missingFields.join(", ");
        this.showErrorModal = true;
        return;
      }
      if (!this.isEmailValid(this.currentUser.email)) {
        this.errorMessage = "El campo Email tiene un formato incorrecto. Debe incluir '@', un punto y al menos un número.";
        this.showErrorModal = true;
        return;
      }
      if (!this.isNumeric(this.currentUser.telefono) || this.currentUser.telefono.length !== 8) {
        this.errorMessage = "El campo Teléfono debe ser numérico y tener 8 dígitos.";
        this.showErrorModal = true;
        return;
      }
      if (this.editIndex !== null) {
        this.users.splice(this.editIndex, 1, { ...this.currentUser });
        this.successMessage = "Usuario actualizado exitosamente.";
      } else {
        this.users.push({ ...this.currentUser });
        this.successMessage = "Se agregó exitosamente.";
      }
      localStorage.setItem("users", JSON.stringify(this.users));
      this.resetCurrentUser();
      this.currentView = "list";
      this.showSuccessModal = true;
      setTimeout(() => {
        this.showSuccessModal = false;
      }, 3000);
    },
    // Reinicia el formulario
    resetCurrentUser() {
      this.currentUser = {
        id: "",
        rol: "2",
        nombre: "",
        email: "",
        contraseña: "",
        telefono: ""
      };
      this.editIndex = null;
    },
    goToCreate() {
      this.resetCurrentUser();
      this.currentView = "create";
    },
    goToList() {
      this.currentView = "list";
    },
    goToEdit(index) {
      this.editIndex = index;
      this.currentUser = { ...this.users[index] };
      this.currentView = "create";
    },
    confirmDelete(index) {
      this.deleteIndex = index;
      this.showDeleteModal = true;
    },
    deleteUser() {
      if (this.deleteIndex !== null) {
        this.users.splice(this.deleteIndex, 1);
        localStorage.setItem("users", JSON.stringify(this.users));
        this.deleteIndex = null;
      }
      this.showDeleteModal = false;
    },
    cancelDelete() {
      this.deleteIndex = null;
      this.showDeleteModal = false;
    }
  }
};
</script>

<style scoped>
.user-component {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.header h2 {
  flex: 1;
  text-align: center;
  margin: 0;
}
.search-box {
  margin-bottom: 10px;
  text-align: center;
}
.search-box input {
  width: 300px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.records-control {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
}
.records-control label {
  font-weight: bold;
}
.user-table {
  width: 100%;
  margin: 0 auto;
  border-collapse: collapse;
  table-layout: auto;
}
.user-table th,
.user-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  vertical-align: middle;
}
.user-table th {
  background-color: #f2f2f2;
}
/* Efecto hover para seleccionar la fila completa */
.user-table tbody tr:hover {
  background-color: #e8f4fc;
  cursor: pointer;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.form-view {
  margin-top: 20px;
}
.user-form {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 10px;
}
.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
.small-input {
  width: 250px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.form-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}
.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-add {
  background-color: #28a745;
  color: #fff;
}
.btn-add:hover {
  background-color: #218838;
}
.btn-edit {
  background-color: #007bff;
  color: #fff;
}
.btn-edit:hover {
  background-color: #0069d9;
}
.btn-delete {
  background-color: #dc3545;
  color: #fff;
}
.btn-delete:hover {
  background-color: #c82333;
}
.btn-save {
  background-color: #28a745;
  color: #fff;
}
.btn-save:hover {
  background-color: #218838;
}
.btn-cancel,
.btn-close {
  background-color: #6c757d;
  color: #fff;
}
.btn-cancel:hover,
.btn-close:hover {
  background-color: #5a6268;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}
.modal-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
}
.modal-success {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #28a745;
  color: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  z-index: 1100;
  animation: fadeInOut 3s ease forwards;
}
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}
</style>


