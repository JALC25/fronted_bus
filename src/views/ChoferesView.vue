<template>
  <div class="chofer-component">
    <!-- Vista de listado -->
    <div v-if="currentView === 'list'">
      <div class="header">
        <h2>Listado de Choferes</h2>
        <button class="btn btn-add" @click="goToCreate">Agregar Chofer</button>
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

      <table class="chofer-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Teléfono</th>
            <th>Licencia de Conducir</th>
            <th>Fecha de Contratación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(chofer, index) in displayedChoferes" :key="chofer.id">
            <td>{{ chofer.id }}</td>
            <td>{{ chofer.nombre }}</td>
            <td>{{ chofer.dni }}</td>
            <td>{{ chofer.telefono }}</td>
            <td>{{ chofer.licencia }}</td>
            <td>{{ chofer.fecha_contratacion }}</td>
            <td class="actions">
              <button class="btn btn-edit" @click="goToEdit(index)">Editar</button>
              <button class="btn btn-delete" @click="confirmDelete(index)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Formulario de creación/edición -->
    <div v-else class="form-view">
      <h2>{{ editIndex !== null ? "Editar Chofer" : "Agregar Chofer" }}</h2>
      <form @submit.prevent="saveChofer" class="chofer-form">
        <div class="form-group">
          <label>ID Chofer:</label>
          <input type="text" v-model="currentChofer.id" class="small-input" disabled />
        </div>
        <div class="form-group">
          <label>Nombre:</label>
          <input type="text" v-model="currentChofer.nombre" class="small-input" @input="validateNombre" placeholder="Ingrese Nombre" required />
        </div>
        <div class="form-group">
          <label>DNI:</label>
          <input type="text" v-model="currentChofer.dni" class="small-input" maxlength="12" @input="validateDNI" placeholder="Ingrese DNI (12 dígitos)" required />
        </div>
        <div class="form-group">
          <label>Teléfono:</label>
          <input type="text" v-model="currentChofer.telefono" class="small-input" maxlength="8" @input="validateTelefono" placeholder="Ingrese Teléfono (8 dígitos)" required />
        </div>
        <div class="form-group">
          <label>Licencia de Conducir:</label>
          <input type="text" v-model="currentChofer.licencia" class="small-input" maxlength="8" @input="validateLicencia" placeholder="Ingrese Licencia (8 dígitos)" required />
        </div>
        <div class="form-group">
          <label>Fecha de Contratación:</label>
          <input type="date" v-model="currentChofer.fecha_contratacion" class="small-input" required />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-save">{{ editIndex !== null ? "Actualizar" : "Guardar" }}</button>
          <button type="button" class="btn btn-cancel" @click="goToList">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- Modal de Confirmación para Eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <p>¿Estás seguro que deseas eliminar este chofer?</p>
        <div class="modal-actions">
          <button @click="deleteChofer" class="btn btn-confirm">Sí</button>
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
  name: "ChoferComponent",
  data() {
    return {
      currentView: "list",
      choferes: JSON.parse(localStorage.getItem("choferes")) || [],
      recordsToShow: "5",
      searchQuery: "",
      showSuccessModal: false,
      successMessage: "",
      showDeleteModal: false,
      deleteIndex: null,
      currentChofer: { id: 1, nombre: "", dni: "", telefono: "", licencia: "", fecha_contratacion: "" },
      editIndex: null
    };
  },
  computed: {
    displayedChoferes() {
      return this.recordsToShow === "todos" ? this.choferes : this.choferes.slice(0, Number(this.recordsToShow));
    }
  },
  methods: {
    generateChoferId() {
      return this.choferes.length > 0 ? Math.max(...this.choferes.map(c => c.id)) + 1 : 1;
    },
    validateNombre() {
      this.currentChofer.nombre = this.currentChofer.nombre.replace(/\d/g, '');
    },
    validateDNI() {
      this.currentChofer.dni = this.currentChofer.dni.replace(/\D/g, '');
    },
    validateTelefono() {
      this.currentChofer.telefono = this.currentChofer.telefono.replace(/\D/g, '');
    },
    validateLicencia() {
      this.currentChofer.licencia = this.currentChofer.licencia.replace(/\D/g, '');
    },
    saveChofer() {
      if (this.editIndex !== null) {
        this.choferes.splice(this.editIndex, 1, { ...this.currentChofer });
      } else {
        this.currentChofer.id = this.generateChoferId();
        this.choferes.push({ ...this.currentChofer });
      }
      localStorage.setItem("choferes", JSON.stringify(this.choferes));
      this.showSuccessModal = true;
      setTimeout(() => (this.showSuccessModal = false), 3000);
      this.resetCurrentChofer();
      this.currentView = "list";
    },
    confirmDelete(index) {
      this.deleteIndex = index;
      this.showDeleteModal = true;
    },
    deleteChofer() {
      this.choferes.splice(this.deleteIndex, 1);
      localStorage.setItem("choferes", JSON.stringify(this.choferes));
      this.showDeleteModal = false;
    },
    goToCreate() {
      this.resetCurrentChofer();
      this.currentView = "create";
    },
    goToEdit(index) {
      this.editIndex = index;
      this.currentChofer = { ...this.choferes[index] };
      this.currentView = "create";
    },
    goToList() {
      this.currentView = "list";
    },
    resetCurrentChofer() {
      this.currentChofer = { id: this.generateChoferId(), nombre: "", dni: "", telefono: "", licencia: "", fecha_contratacion: "" };
      this.editIndex = null;
    }
  }
};
</script>




<style scoped>
.chofer-component {
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
.chofer-table {
  width: 100%;
  margin: 0 auto;
  border-collapse: collapse;
  table-layout: auto;
}
.chofer-table th,
.chofer-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  vertical-align: middle;
}
.chofer-table th {
  background-color: #f2f2f2;
}
.chofer-table tbody tr:hover {
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
.chofer-form {
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