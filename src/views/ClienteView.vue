<template>
  <div class="cliente-component">
    <!-- Vista de listado -->
    <div v-if="currentView === 'list'">
      <div class="header">
        <h2>Listado de Clientes</h2>
        <button class="btn btn-add" @click="goToCreate">Agregar Cliente</button>
      </div>

      <!-- Buscador por Nombre -->
      <div class="search-box">
        <label for="search">Buscar por Nombre:</label>
        <input type="text" id="search" v-model="searchQuery" placeholder="Ingrese nombre" />
      </div>

      <!-- Control de registros a mostrar -->
      <div class="records-control">
        <label for="recordsSelect">Mostrar registros:</label>
        <select id="recordsSelect" v-model="recordsToShow">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <table class="cliente-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cliente, index) in displayedClientes" :key="cliente.id">
            <td>{{ cliente.id }}</td>
            <td>{{ cliente.nombre }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.email }}</td>
            <td class="actions">
              <button class="btn btn-edit" @click="goToEdit(index)">Editar</button>
              <button class="btn btn-delete" @click="confirmDelete(index)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Formulario de creación/edición -->
    <div v-else-if="currentView === 'create'" class="form-view">
      <h2>{{ editIndex !== null ? "Editar Cliente" : "Agregar Cliente" }}</h2>
      <form @submit.prevent="saveCliente" class="cliente-form">
        <div class="form-group">
          <label for="id">ID Cliente:</label>
          <input type="text" id="id" v-model="currentCliente.id" class="small-input" disabled />
        </div>
        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input type="text" id="nombre" v-model="currentCliente.nombre" placeholder="Ingrese Nombre" class="small-input" @input="validateNombre" />
        </div>
        <div class="form-group">
          <label for="telefono">Teléfono:</label>
          <input type="text" id="telefono" v-model="currentCliente.telefono" placeholder="Ingrese Teléfono (8 dígitos)" class="small-input" maxlength="8" @input="validateTelefono" />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="currentCliente.email" placeholder="Ingrese Email" class="small-input" />
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

    <!-- Modal de Confirmación para Eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <p>¿Estás seguro que deseas eliminar este cliente?</p>
        <div class="modal-actions">
          <button @click="deleteCliente" class="btn btn-confirm">Sí</button>
          <button @click="showDeleteModal = false" class="btn btn-cancel">No</button>
        </div>
      </div>
    </div>

    <!-- Modal de Éxito en la parte superior derecha -->
    <div v-if="showSuccessModal" class="modal-success">
      <p>{{ successMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClienteComponent",
  data() {
    return {
      currentView: "list",
      clientes: JSON.parse(localStorage.getItem("clientes")) || [],
      recordsToShow: "5",
      searchQuery: "",
      showErrorModal: false,
      errorMessage: "",
      showSuccessModal: false,
      successMessage: "",
      showDeleteModal: false,
      deleteIndex: null,
      currentCliente: { id: 1, nombre: "", telefono: "", email: "" },
      editIndex: null
    };
  },
  computed: {
    filteredClientes() {
      if (!this.searchQuery.trim()) return this.clientes;
      return this.clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    displayedClientes() {
      if (this.recordsToShow === "todos") {
        return this.filteredClientes;
      } else {
        return this.filteredClientes.slice(0, Number(this.recordsToShow));
      }
    }
  },
  methods: {
    generateClienteId() {
      return this.clientes.length > 0 ? Math.max(...this.clientes.map(c => c.id)) + 1 : 1;
    },
    validateNombre() {
      this.currentCliente.nombre = this.currentCliente.nombre.replace(/\d/g, '');
    },
    validateTelefono() {
      this.currentCliente.telefono = this.currentCliente.telefono.replace(/\D/g, '');
    },
    saveCliente() {
      if (!this.currentCliente.nombre || !this.currentCliente.telefono || !this.currentCliente.email) {
        this.errorMessage = "Todos los campos son obligatorios.";
        this.showErrorModal = true;
        return;
      }

      if (this.editIndex !== null) {
        this.clientes.splice(this.editIndex, 1, { ...this.currentCliente });
        this.successMessage = "Cliente actualizado correctamente.";
      } else {
        this.currentCliente.id = this.generateClienteId();
        this.clientes.push({ ...this.currentCliente });
        this.successMessage = "Cliente agregado correctamente.";
      }

      localStorage.setItem("clientes", JSON.stringify(this.clientes));

      this.showSuccessModal = true;
      setTimeout(() => (this.showSuccessModal = false), 3000);
      this.resetCurrentCliente();
      this.currentView = "list";
    },
    confirmDelete(index) {
      this.deleteIndex = index;
      this.showDeleteModal = true;
    },
    deleteCliente() {
      if (this.deleteIndex !== null) {
        this.clientes.splice(this.deleteIndex, 1);
        localStorage.setItem("clientes", JSON.stringify(this.clientes));
      }
      this.showDeleteModal = false;
    },
    goToCreate() {
      this.resetCurrentCliente();
      this.currentView = "create";
    },
    goToEdit(index) {
      this.editIndex = index;
      this.currentCliente = { ...this.clientes[index] };
      this.currentView = "create";
    },
    goToList() {
      this.currentView = "list";
    },
    resetCurrentCliente() {
      this.currentCliente = { id: this.generateClienteId(), nombre: "", telefono: "", email: "" };
      this.editIndex = null;
    }
  }
};
</script>


<style scoped>
.cliente-component {
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
  align-items: center;
  gap: 10px;
}
.records-control label {
  font-weight: bold;
}
.cliente-table {
  width: 100%;
  margin: 0 auto;
  border-collapse: collapse;
  table-layout: auto;
}
.cliente-table th,
.cliente-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  vertical-align: middle;
}
.cliente-table th {
  background-color: #f2f2f2;
}
.cliente-table tbody tr:hover {
  background-color: #e8f4fc;
}

.actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  min-width: 150px; /* Fija un ancho mínimo para que se adapte a los demás campos */
}
.form-view {
  margin-top: 20px;
}
.cliente-form {
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