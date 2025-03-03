<template>
  <div class="ruta-component">
    <!-- Vista de listado -->
    <div v-if="currentView === 'list'">
      <div class="header">
        <h2>Listado de Rutas</h2>
        <button class="btn btn-add" @click="goToCreate">Agregar Ruta</button>
      </div>

      <!-- Buscador por Origen -->
      <div class="search-box">
        <label for="search">Buscar por Origen:</label>
        <input type="text" v-model="searchQuery" placeholder="Ingrese el origen" />
      </div>

      <table class="ruta-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Distancia (Km)</th>
            <th>Duración (hr)</th>
            <th>Precio Base (Lp)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ruta, index) in filteredRutas" :key="ruta.id">
            <td>{{ ruta.id }}</td>
            <td>{{ ruta.origen }}</td>
            <td>{{ ruta.destino }}</td>
            <td>{{ ruta.distancia }}</td>
            <td>{{ ruta.duracion }}</td>
            <td>{{ ruta.precio_base }}</td>
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
      <h2>{{ editIndex !== null ? "Editar Ruta" : "Agregar Ruta" }}</h2>
      <form @submit.prevent="saveRuta" class="ruta-form">
        <div class="form-group">
          <label>ID Ruta:</label>
          <input type="text" v-model="currentRuta.id" class="small-input" disabled />
        </div>
        <div class="form-group">
          <label>Origen:</label>
          <input type="text" v-model="currentRuta.origen" class="small-input" @input="validateText('origen')" placeholder="Ingrese el origen" required />
        </div>
        <div class="form-group">
          <label>Destino:</label>
          <input type="text" v-model="currentRuta.destino" class="small-input" @input="validateText('destino')" placeholder="Ingrese el destino" required />
        </div>
        <div class="form-group">
          <label>Distancia (Km):</label>
          <input type="number" v-model="currentRuta.distancia" class="small-input" min="1" placeholder="Ingrese la distancia" required />
        </div>
        <div class="form-group">
          <label>Duración (hr):</label>
          <input type="number" v-model="currentRuta.duracion" class="small-input" min="1" placeholder="Ingrese la duración" required />
        </div>
        <div class="form-group">
          <label>Precio Base (Lp):</label>
          <input type="number" v-model="currentRuta.precio_base" class="small-input" min="1" placeholder="Ingrese el precio base" required />
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
        <p>¿Estás seguro que deseas eliminar esta ruta?</p>
        <div class="modal-actions">
          <button @click="deleteRuta" class="btn btn-confirm">Sí</button>
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
  name: "RutaComponent",
  data() {
    return {
      currentView: "list",
      rutas: JSON.parse(localStorage.getItem("rutas")) || [],
      searchQuery: "",
      showSuccessModal: false,
      successMessage: "",
      showErrorModal: false,
      errorMessage: "",
      showDeleteModal: false,
      deleteIndex: null,
      currentRuta: { id: 1, origen: "", destino: "", distancia: "", duracion: "", precio_base: "" },
      editIndex: null
    };
  },
  computed: {
    filteredRutas() {
      return this.searchQuery.trim()
        ? this.rutas.filter((ruta) =>
            ruta.origen.toLowerCase().includes(this.searchQuery.toLowerCase())
          )
        : this.rutas;
    }
  },
  methods: {
    generateRutaId() {
      return this.rutas.length > 0 ? Math.max(...this.rutas.map((r) => r.id)) + 1 : 1;
    },
    validateText(field) {
      this.currentRuta[field] = this.currentRuta[field].replace(/\d/g, '');
    },
    saveRuta() {
      let missingFields = [];
      if (!this.currentRuta.origen) missingFields.push("Origen");
      if (!this.currentRuta.destino) missingFields.push("Destino");
      if (!this.currentRuta.distancia) missingFields.push("Distancia");
      if (!this.currentRuta.duracion) missingFields.push("Duración");
      if (!this.currentRuta.precio_base) missingFields.push("Precio Base");

      if (missingFields.length > 0) {
        this.errorMessage = "Faltan completar los siguientes campos: " + missingFields.join(", ");
        this.showErrorModal = true;
        return;
      }

      if (this.editIndex !== null) {
        this.rutas.splice(this.editIndex, 1, { ...this.currentRuta });
        this.successMessage = "Ruta actualizada con éxito.";
      } else {
        this.currentRuta.id = this.generateRutaId();
        this.rutas.push({ ...this.currentRuta });
        this.successMessage = "Ruta agregada con éxito.";
      }

      localStorage.setItem("rutas", JSON.stringify(this.rutas));
      this.showSuccessModal = true;
      setTimeout(() => (this.showSuccessModal = false), 3000);
      this.goToList();
    },
    confirmDelete(index) {
      this.deleteIndex = index;
      this.showDeleteModal = true;
    },
    deleteRuta() {
      this.rutas.splice(this.deleteIndex, 1);
      localStorage.setItem("rutas", JSON.stringify(this.rutas));
      this.showDeleteModal = false;
    },
    goToCreate() {
      this.currentRuta = { id: this.generateRutaId(), origen: "", destino: "", distancia: "", duracion: "", precio_base: "" };
      this.editIndex = null;
      this.currentView = "create";
    },
    goToEdit(index) {
      this.editIndex = index;
      this.currentRuta = { ...this.rutas[index] };
      this.currentView = "create";
    },
    goToList() {
      this.currentView = "list";
    }
  }
};
</script>



<style scoped>
.ruta-component {
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
.ruta-table {
  width: 100%;
  margin: 0 auto;
  border-collapse: collapse;
  table-layout: auto;
}
.ruta-table th,
.ruta-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  vertical-align: middle;
}
.ruta-table th {
  background-color: #f2f2f2;
}
.ruta-table tbody tr:hover {
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
.ruta-form {
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
