<template>
  <div class="container">
    <h1>Gestión de Choferes</h1>

    <!-- Opciones de Visualización -->
    <div class="options-container">
      <label>Mostrar:</label>
      <select v-model="itemsPorPagina">
        <option value="5">5</option>
        <option value="todos">Todos</option>
      </select>
      <input v-model="busquedaId" type="number" placeholder="Buscar por ID" />
      <button class="btn btn-primary" @click="buscarChofer">Buscar</button>
      <button class="btn btn-secondary" @click="cargarChoferes">Mostrar Todos</button>
    </div>

    <!-- Botón Agregar Chofer -->
    <button class="btn btn-success" @click="abrirModalAgregar">Agregar Chofer</button>

    <!-- Tabla de Choferes -->
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Empresa</th>
          <th>Nombre</th>
          <th>DNI</th>
          <th>Teléfono</th>
          <th>Licencia</th>
          <th>Fecha de Contratación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="chofer in choferesPaginados" :key="chofer.id_chofer">
          <td>{{ chofer.id_chofer }}</td>
          <td>{{ obtenerNombreEmpresa(chofer.id_empresa) }}</td>
          <td>{{ chofer.nombre }}</td>
          <td>{{ chofer.dni }}</td>
          <td>{{ chofer.telefono }}</td>
          <td>{{ chofer.licencia_conducir }}</td>
          <td>{{ formatearFecha(chofer.fecha_contratacion) }}</td>
          <td>
            <button class="btn btn-warning" @click="editarChofer(chofer)">Editar</button>
            <button class="btn btn-danger" @click="eliminarChofer(chofer.id_chofer)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Agregar/Edit Chofer -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-content">
        <h2>{{ esEdicion ? 'Editar Chofer' : 'Agregar Chofer' }}</h2>

        <div class="form-group">
          <label>Empresa:</label>
          <select v-model="choferFormulario.id_empresa" required>
            <option disabled value="">Seleccione una empresa</option>
            <option v-for="empresa in empresas" :key="empresa.id_empresa" :value="empresa.id_empresa">
              {{ empresa.nombre_empresa }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="choferFormulario.nombre" type="text" @input="validarNombre" required />
        </div>

        <div class="form-group">
          <label>DNI:</label>
          <input v-model="choferFormulario.dni" type="text" @input="validarDNI" required />
        </div>

        <div class="form-group">
          <label>Teléfono:</label>
          <input v-model="choferFormulario.telefono" type="text" @input="validarTelefono" required />
        </div>

        <div class="form-group">
          <label>Licencia de Conducir:</label>
          <input v-model="choferFormulario.licencia_conducir" type="text" required />
        </div>

        <div class="form-group">
          <label>Fecha de Contratación:</label>
          <input v-model="choferFormulario.fecha_contratacion" type="date" required />
        </div>

        <div class="button-group">
          <button class="btn btn-success" @click="guardarChofer">Guardar</button>
          <button class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      choferes: [],
      empresas: [],
      busquedaId: "",
      mostrarModal: false,
      esEdicion: false,
      choferFormulario: { 
        id_empresa: "", 
        nombre: "", 
        dni: "", 
        telefono: "", 
        licencia_conducir: "", 
        fecha_contratacion: "" 
      },
      itemsPorPagina: "5",
    };
  },
  computed: {
    choferesPaginados() {
      // Ordenar por ID descendente para que los más nuevos aparezcan primero
      const choferesOrdenados = [...this.choferes].sort((a, b) => b.id_chofer - a.id_chofer);
      return this.itemsPorPagina === "todos" ? choferesOrdenados : choferesOrdenados.slice(0, Number(this.itemsPorPagina));
    },
  },
  methods: {
    formatearFecha(fecha) {
      if (!fecha) return '';
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(fecha).toLocaleDateString('es-ES', options);
    },
    validarNombre() {
      this.choferFormulario.nombre = this.choferFormulario.nombre.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ\s]/g, "");
    },
    validarDNI() {
      this.choferFormulario.dni = this.choferFormulario.dni.replace(/\D/g, "").slice(0, 13);
    },
    validarTelefono() {
      this.choferFormulario.telefono = this.choferFormulario.telefono.replace(/\D/g, "").slice(0, 8);
    },
    async cargarChoferes() {
      try {
        const response = await axios.get("http://localhost:3001/choferes");
        // Ordenar por ID descendente para que los más nuevos aparezcan primero
        this.choferes = response.data.sort((a, b) => b.id_chofer - a.id_chofer);
      } catch (error) {
        console.error("Error al cargar los choferes:", error);
        alert("Error al cargar los choferes.");
      }
    },
    async cargarEmpresas() {
      try {
        const response = await axios.get("http://localhost:3001/empresas");
        this.empresas = response.data || [];
      } catch (error) {
        console.error("Error al cargar las empresas:", error);
        alert("Error al cargar las empresas.");
      }
    },
    obtenerNombreEmpresa(idEmpresa) {
      const empresa = this.empresas.find(emp => emp.id_empresa === idEmpresa);
      return empresa ? empresa.nombre_empresa : "Desconocido";
    },
    async buscarChofer() {
      if (!this.busquedaId) {
        alert("Ingrese un ID válido");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/choferes/${this.busquedaId}`);
        this.choferes = [response.data];
      } catch (error) {
        console.error("Error al buscar chofer:", error);
        alert("Chofer no encontrado");
      }
    },
    async eliminarChofer(id) {
      if (!confirm("¿Estás seguro de eliminar este chofer?")) return;
      try {
        await axios.delete(`http://localhost:3001/choferes/${id}`);
        alert("Chofer eliminado correctamente");
        this.cargarChoferes();
      } catch (error) {
        console.error("Error al eliminar chofer:", error);
        alert("Error al eliminar chofer.");
      }
    },
    abrirModalAgregar() {
      this.choferFormulario = { 
        id_empresa: "", 
        nombre: "", 
        dni: "", 
        telefono: "", 
        licencia_conducir: "", 
        fecha_contratacion: new Date().toISOString().split('T')[0] // Fecha actual por defecto
      };
      this.esEdicion = false;
      this.mostrarModal = true;
    },
    editarChofer(chofer) {
      this.choferFormulario = { 
        ...chofer,
        fecha_contratacion: chofer.fecha_contratacion.split('T')[0] // Formatear fecha para el input
      };
      this.esEdicion = true;
      this.mostrarModal = true;
    },
    async guardarChofer() {
      try {
        if (this.esEdicion) {
          await axios.put(`http://localhost:3001/choferes/${this.choferFormulario.id_chofer}`, this.choferFormulario);
          alert("Chofer actualizado correctamente.");
        } else {
          const response = await axios.post("http://localhost:3001/choferes", this.choferFormulario);
          // Agregar el nuevo chofer al principio del array
          this.choferes.unshift(response.data);
          alert("Chofer agregado correctamente.");
        }
        this.cerrarModal();
      } catch (error) {
        console.error("Error al guardar el chofer:", error);
        alert("Error al guardar el chofer.");
      }
    },
    cerrarModal() {
      this.mostrarModal = false;
    }
  },
  mounted() {
    this.cargarChoferes();
    this.cargarEmpresas();
  }
};
</script>

<style>
.container {
  max-width: 1200px;
  margin: auto;
  font-family: Arial, sans-serif;
  padding: 20px;
}
h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}
.options-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}
.options-container label {
  font-weight: bold;
}
.options-container select, 
.options-container input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
th {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}
tr:nth-child(even) {
  background-color: #f8f9fa;
}
tr:hover {
  background-color: #e9ecef;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 500px;
  max-width: 95%;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.modal-content h2 {
  margin-top: 0;
  color: #007bff;
  text-align: center;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* Botones */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-primary:hover {
  background-color: #0069d9;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn-secondary:hover {
  background-color: #5a6268;
}
.btn-success {
  background-color: #28a745;
  color: white;
}
.btn-success:hover {
  background-color: #218838;
}
.btn-warning {
  background-color: #ffc107;
  color: #212529;
}
.btn-warning:hover {
  background-color: #e0a800;
}
.btn-danger {
  background-color: #dc3545;
  color: white;
}
.btn-danger:hover {
  background-color: #c82333;
}
</style>



<style>
.container {
  max-width: 900px;
  margin: auto;
  font-family: Arial, sans-serif;
}
h1 {
  text-align: center;
  margin-bottom: 20px;
}
.options-container {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
th {
  background: #007bff;
  color: white;
  padding: 12px; /* Aumenta el padding para que el encabezado sea más ancho */
  min-width: 100px; /* Establece un ancho mínimo para las celdas del encabezado */
}
.fila-seleccionada {
  background: #d1ecf1 !important;
}

/* Estilo para el hover en las filas de la tabla */
.table tbody tr:hover {
  background-color: #f5f5f5; /* Cambia el color de fondo al pasar el cursor */
  cursor: pointer; /* Cambia el cursor a una mano */
}

/* Modal */
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 300px;
}
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  text-align: left;
}
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

/* Botones */
.btn {
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}
.btn-primary { background: #007bff; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-success { background: #28a745; color: white; }
.btn-warning { background: #ffc107; color: black; }
.btn-danger { background: #dc3545; color: white; }

/* Contenedor de botones en la tabla */
.button-container {
  display: flex;
  gap: 5px;
  justify-content: center;
}
</style>