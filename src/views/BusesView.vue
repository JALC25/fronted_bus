<template>
  <div class="bus-component">
    <!-- Vista de listado -->
    <div v-if="currentView === 'list'">
      <div class="header">
        <h2>Listado de Autobuses</h2>
        <button class="btn btn-add" @click="goToCreate">Agregar Autobús</button>
      </div>

      <!-- Buscador por Nombre -->
      <div class="search-box">
        <label for="search">Buscar por Placa:</label>
        <input type="text" v-model="searchQuery" placeholder="Ingrese la placa" />
      </div>

      <!-- Control de registros a mostrar -->
      <div class="records-control">
        <label>Mostrar registros:</label>
        <select v-model="recordsToShow">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <table class="bus-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Placa</th>
            <th>Capacidad</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(bus, index) in displayedBuses" :key="bus.id">
            <td>{{ bus.id }}</td>
            <td>{{ bus.placa }}</td>
            <td>{{ bus.capacidad }}</td>
            <td>{{ bus.tipo }}</td>
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
      <h2>{{ editIndex !== null ? "Editar Autobús" : "Agregar Autobús" }}</h2>
      <form @submit.prevent="saveBus" class="bus-form">
        <div class="form-group">
          <label>ID Autobús:</label>
          <input type="text" v-model="currentBus.id" class="small-input" disabled />
        </div>
        <div class="form-group">
          <label>Placa:</label>
          <input type="text" v-model="currentBus.placa" class="small-input" placeholder="Ingrese la placa" />
        </div>
        <div class="form-group">
          <label>Capacidad:</label>
          <input type="number" v-model="currentBus.capacidad" class="small-input" min="1" placeholder="Ingrese la capacidad" />
        </div>
        <div class="form-group">
          <label>Tipo:</label>
          <input type="text" v-model="currentBus.tipo" class="small-input" placeholder="Ingrese el tipo de autobús" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-save">{{ editIndex !== null ? "Actualizar" : "Guardar" }}</button>
          <button type="button" class="btn btn-cancel" @click="goToList">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- Modal de Error con Campos Faltantes -->
    <div v-if="showErrorModal" class="modal-overlay">
      <div class="modal">
        <p>{{ errorMessage }}</p>
        <button @click="showErrorModal = false" class="btn btn-close">Cerrar</button>
      </div>
    </div>

    <!-- Modal de Confirmación para Eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <p>¿Estás seguro que deseas eliminar este autobús?</p>
        <div class="modal-actions">
          <button @click="deleteBus" class="btn btn-confirm">Sí</button>
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
  name: "BusComponent",
  data() {
    return {
      currentView: "list",
      buses: JSON.parse(localStorage.getItem("buses")) || [],
      recordsToShow: "5",
      searchQuery: "",
      showSuccessModal: false,
      successMessage: "",
      showErrorModal: false,
      errorMessage: "",
      showDeleteModal: false,
      deleteIndex: null,
      currentBus: { id: 1, placa: "", capacidad: "", tipo: "" },
      editIndex: null
    };
  },
  computed: {
    displayedBuses() {
      return this.recordsToShow === "todos" ? this.buses : this.buses.slice(0, Number(this.recordsToShow));
    }
  },
  methods: {
    generateBusId() {
      return this.buses.length > 0 ? Math.max(...this.buses.map(b => b.id)) + 1 : 1;
    },
    saveBus() {
      let missingFields = [];
      if (!this.currentBus.placa) missingFields.push("Placa");
      if (!this.currentBus.capacidad) missingFields.push("Capacidad");
      if (!this.currentBus.tipo) missingFields.push("Tipo");

      if (missingFields.length > 0) {
        this.errorMessage = "Faltan completar los siguientes campos: " + missingFields.join(", ");
        this.showErrorModal = true;
        return;
      }

      if (this.editIndex !== null) {
        this.buses.splice(this.editIndex, 1, { ...this.currentBus });
        this.successMessage = "Autobús actualizado con éxito.";
      } else {
        this.currentBus.id = this.generateBusId();
        this.buses.push({ ...this.currentBus });
        this.successMessage = "Autobús agregado con éxito.";
      }

      localStorage.setItem("buses", JSON.stringify(this.buses));
      this.showSuccessModal = true;
      setTimeout(() => (this.showSuccessModal = false), 3000);
      this.resetCurrentBus();
      this.currentView = "list";
    },
    confirmDelete(index) {
      this.deleteIndex = index;
      this.showDeleteModal = true;
    },
    deleteBus() {
      this.buses.splice(this.deleteIndex, 1);
      localStorage.setItem("buses", JSON.stringify(this.buses));
      this.showDeleteModal = false;
    },
    goToCreate() {
      this.resetCurrentBus();
      this.currentView = "create";
    },
    goToEdit(index) {
      this.editIndex = index;
      this.currentBus = { ...this.buses[index] };
      this.currentView = "create";
    },
    goToList() {
      this.currentView = "list";
    },
    resetCurrentBus() {
      this.currentBus = { id: this.generateBusId(), placa: "", capacidad: "", tipo: "" };
      this.editIndex = null;
    }
  }
};
</script>

<style scoped>
.bus-component {
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
.bus-table {
  width: 100%;
  margin: 0 auto;
  border-collapse: collapse;
  table-layout: auto;
}
.bus-table th,
.bus-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  vertical-align: middle;
}
.bus-table th {
  background-color: #f2f2f2;
}
.bus-table tbody tr:hover {
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