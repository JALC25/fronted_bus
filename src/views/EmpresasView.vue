<template>
  <div class="empresa-component">
    <!-- Vista de listado -->
    <div v-if="currentView === 'list'">
      <div class="header">
        <h2>Listado de Empresas</h2>
        <button class="btn btn-add" @click="goToCreate">Agregar Empresa</button>
      </div>
      <!-- Barra de búsqueda por Nombre -->
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
      <table class="empresa-table">
        <thead>
          <tr>
            <th>N°</th>
            <th>Id</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Logo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(empresa, index) in displayedEmpresas" :key="empresa.id">
            <td>{{ index + 1 }}</td>
            <td>{{ empresa.id }}</td>
            <td>{{ empresa.nombre }}</td>
            <td>{{ empresa.direccion }}</td>
            <td>{{ empresa.telefono }}</td>
            <td>{{ empresa.email }}</td>
            <td>
              <img v-if="empresa.logo" :src="empresa.logo" alt="Logo" class="table-logo" />
              <span v-else>No Logo</span>
            </td>
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
      <h2>{{ editIndex !== null ? "Editar Empresa" : "Crear Empresa" }}</h2>
      <form @submit.prevent="saveEmpresa" class="empresa-form">
        <div class="form-group">
          <label for="id">Id:</label>
          <input type="text" id="id" v-model="currentEmpresa.id" placeholder="Ingrese Id" class="small-input" />
        </div>
        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input type="text" id="nombre" v-model="currentEmpresa.nombre" placeholder="Ingrese Nombre" class="small-input" />
        </div>
        <div class="form-group">
          <label for="direccion">Dirección:</label>
          <input type="text" id="direccion" v-model="currentEmpresa.direccion" placeholder="Ingrese Dirección" class="small-input" />
        </div>
        <div class="form-group">
          <label for="telefono">Teléfono:</label>
          <input type="text" id="telefono" v-model="currentEmpresa.telefono" placeholder="Ingrese Teléfono (8 dígitos)" class="small-input" maxlength="8" />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="currentEmpresa.email" placeholder="Ingrese Email" class="small-input" />
        </div>
        <div class="form-group">
          <label for="logo">Logo:</label>
          <input type="file" id="logo" @change="handleLogoUpload" accept="image/*" class="small-input" />
          <div v-if="currentEmpresa.logo" class="logo-preview">
            <img :src="currentEmpresa.logo" alt="Logo Preview" />
          </div>
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
  
    <!-- Modal de Confirmación para Eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <p>¿Está seguro que desea eliminar la empresa?</p>
        <div class="modal-actions">
          <button @click="deleteEmpresa" class="btn btn-confirm">Sí</button>
          <button @click="cancelDelete" class="btn btn-cancel">No</button>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
export default {
  name: "EmpresaComponent",
  data() {
    return {
      currentView: "list", // "list" o "create"
      empresas: [],
      searchQuery: "",
      recordsToShow: "5",
      showErrorModal: false,
      errorMessage: "",
      showSuccessModal: false,
      successMessage: "",
      showDeleteModal: false,
      deleteIndex: null,
      currentEmpresa: {
        id: "",
        nombre: "",
        direccion: "",
        telefono: "",
        email: "",
        logo: ""
      },
      editIndex: null
    };
  },
  computed: {
    // Filtra las empresas por el campo Nombre (en tiempo real)
    filteredEmpresas() {
      if (!this.searchQuery.trim()) return this.empresas;
      const query = this.searchQuery.toLowerCase();
      return this.empresas.filter(empresa =>
        empresa.nombre.toLowerCase().includes(query)
      );
    },
    // Aplica el control de registros a mostrar
    displayedEmpresas() {
      if (this.recordsToShow === "todos") {
        return this.filteredEmpresas;
      } else {
        return this.filteredEmpresas.slice(0, Number(this.recordsToShow));
      }
    }
  },
  created() {
    // Cargar las empresas desde localStorage para persistir datos entre sesiones
    const storedEmpresas = localStorage.getItem("empresas");
    if (storedEmpresas) {
      this.empresas = JSON.parse(storedEmpresas);
    }
  },
  methods: {
    // Validación básica para el email
    isEmailValid(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    // Comprueba que el valor sea numérico
    isNumeric(value) {
      return !isNaN(value);
    },
    // Maneja la carga del logo (imagen) y la convierte a Base64
    handleLogoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.currentEmpresa.logo = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    // Guarda (crea o actualiza) la empresa tras validar los campos
    saveEmpresa() {
      let missingFields = [];
      if (!this.currentEmpresa.id) missingFields.push("Id");
      if (!this.currentEmpresa.nombre) missingFields.push("Nombre");
      if (!this.currentEmpresa.direccion) missingFields.push("Dirección");
      if (!this.currentEmpresa.telefono) missingFields.push("Teléfono");
      if (!this.currentEmpresa.email) missingFields.push("Email");
      if (!this.currentEmpresa.logo) missingFields.push("Logo");
  
      if (missingFields.length > 0) {
        this.errorMessage = "Falta completar el/los siguiente(s) campo(s): " + missingFields.join(", ");
        this.showErrorModal = true;
        return;
      }
      if (!this.isEmailValid(this.currentEmpresa.email)) {
        this.errorMessage = "El campo Email tiene un formato incorrecto.";
        this.showErrorModal = true;
        return;
      }
      if (!this.isNumeric(this.currentEmpresa.telefono) || this.currentEmpresa.telefono.length !== 8) {
        this.errorMessage = "El campo Teléfono debe ser numérico y tener 8 dígitos.";
        this.showErrorModal = true;
        return;
      }
      if (this.editIndex !== null) {
        this.empresas.splice(this.editIndex, 1, { ...this.currentEmpresa });
        this.successMessage = "Empresa actualizada exitosamente.";
      } else {
        this.empresas.push({ ...this.currentEmpresa });
        this.successMessage = "Se agregó correctamente.";
      }
      localStorage.setItem("empresas", JSON.stringify(this.empresas));
      this.resetCurrentEmpresa();
      this.currentView = "list";
      this.showSuccessModal = true;
      setTimeout(() => {
        this.showSuccessModal = false;
      }, 3000);
    },
    // Reinicia el formulario de empresa
    resetCurrentEmpresa() {
      this.currentEmpresa = {
        id: "",
        nombre: "",
        direccion: "",
        telefono: "",
        email: "",
        logo: ""
      };
      this.editIndex = null;
    },
    goToCreate() {
      this.resetCurrentEmpresa();
      this.currentView = "create";
    },
    goToList() {
      this.currentView = "list";
    },
    goToEdit(index) {
      this.editIndex = index;
      this.currentEmpresa = { ...this.empresas[index] };
      this.currentView = "create";
    },
    confirmDelete(index) {
      this.deleteIndex = index;
      this.showDeleteModal = true;
    },
    deleteEmpresa() {
      if (this.deleteIndex !== null) {
        this.empresas.splice(this.deleteIndex, 1);
        localStorage.setItem("empresas", JSON.stringify(this.empresas));
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
.empresa-component {
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
.empresa-table {
  width: 100%;
  margin: 0 auto;
  border-collapse: collapse;
  table-layout: auto;
}
.empresa-table th,
.empresa-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  vertical-align: middle;
}
.empresa-table th {
  background-color: #f2f2f2;
}
.empresa-table tbody tr:hover {
  background-color: #e8f4fc;
}
.table-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
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
.empresa-form {
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
.logo-preview img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-top: 10px;
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
