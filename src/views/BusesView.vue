<template>
  <div class="container">
    <h1>Gestión de Autobuses</h1>

    <!-- Opciones de Visualización -->
    <div class="options-container">
      <label>Mostrar:</label>
      <select v-model="itemsPorPagina">
        <option value="5">5</option>
        <option value="todos">Todos</option>
      </select>
      <input v-model="busquedaId" type="number" placeholder="Buscar por ID" />
      <button class="btn btn-primary" @click="buscarAutobus">Buscar</button>
      <button class="btn btn-secondary" @click="cargarAutobuses">Mostrar Todos</button>
    </div>

    <!-- Botón Agregar Autobús -->
    <button class="btn btn-success" @click="abrirModalAgregar">Agregar Autobús</button>

    <!-- Tabla de Autobuses -->
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Empresa</th>
          <th>Chofer</th>
          <th>Placa</th>
          <th>Capacidad</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="autobus in autobusesPaginados" :key="autobus.id_bus" @mouseover="filaSeleccionada = autobus.id_bus" @mouseleave="filaSeleccionada = null" :class="{ 'fila-seleccionada': filaSeleccionada === autobus.id_bus }">
          <td>{{ autobus.id_bus }}</td>
          <td>{{ obtenerNombreEmpresa(autobus.id_empresa) }}</td>
          <td>{{ obtenerNombreChofer(autobus.id_chofer) }}</td>
          <td>{{ autobus.placa }}</td>
          <td>{{ autobus.capacidad }}</td>
          <td class="acciones">
            <button class="btn btn-warning" @click="editarAutobus(autobus)">Editar</button>
            <button class="btn btn-danger" @click="eliminarAutobus(autobus.id_bus)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Agregar/Edit Autobús -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-content">
        <h2>{{ esEdicion ? 'Editar Autobús' : 'Agregar Autobús' }}</h2>

        <div class="form-layout">
          <div class="form-group">
            <label>Empresa:</label>
            <select v-model="autobusFormulario.id_empresa">
              <option disabled value="">Seleccione una empresa</option>
              <option v-for="empresa in empresas" :key="empresa.id_empresa" :value="empresa.id_empresa">
                {{ empresa.nombre_empresa }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Chofer:</label>
            <select v-model="autobusFormulario.id_chofer">
              <option value="">Sin chofer asignado</option>
              <option v-for="chofer in choferes" :key="chofer.id_chofer" :value="chofer.id_chofer">
                {{ chofer.nombre }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Placa:</label>
            <input v-model="autobusFormulario.placa" type="text" required />
          </div>

          <div class="form-group">
            <label>Capacidad:</label>
            <input v-model="autobusFormulario.capacidad" type="number" min="10" max="100" required />
          </div>
        </div>

        <div class="button-group">
          <button class="btn btn-success" @click="guardarAutobus">Guardar</button>
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
      autobuses: [],
      empresas: [],
      choferes: [],
      busquedaId: "",
      mostrarModal: false,
      esEdicion: false,
      filaSeleccionada: null,
      autobusFormulario: { id_empresa: "", id_chofer: "", placa: "", capacidad: "" },
      itemsPorPagina: "5",
    };
  },
  computed: {
    autobusesPaginados() {
      return this.itemsPorPagina === "todos" ? this.autobuses : this.autobuses.slice(0, Number(this.itemsPorPagina));
    },
  },
  methods: {
    async cargarAutobuses() {
      try {
        const response = await axios.get("http://localhost:3001/api/autobuses");
        this.autobuses = response.data || [];
      } catch (error) {
        alert("Error al cargar los autobuses.");
      }
    },
    async cargarEmpresasYChoferes() {
      try {
        const empresasRes = await axios.get("http://localhost:3001/empresas");
        this.empresas = empresasRes.data || [];

        const choferesRes = await axios.get("http://localhost:3001/choferes");
        this.choferes = choferesRes.data || [];
      } catch (error) {
        alert("Error al cargar empresas y choferes.");
      }
    },
    obtenerNombreEmpresa(idEmpresa) {
      const empresa = this.empresas.find(emp => emp.id_empresa === idEmpresa);
      return empresa ? empresa.nombre_empresa : "Desconocido";
    },
    obtenerNombreChofer(idChofer) {
      const chofer = this.choferes.find(ch => ch.id_chofer === idChofer);
      return chofer ? chofer.nombre : "Sin asignar";
    },
    async buscarAutobus() {
      if (!this.busquedaId) {
        alert("Ingrese un ID válido");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/api/autobuses/${this.busquedaId}`);
        this.autobuses = [response.data];
      } catch (error) {
        alert("Autobús no encontrado");
      }
    },
    async eliminarAutobus(id) {
      if (!confirm("¿Estás seguro de eliminar este autobús?")) return;
      try {
        await axios.delete(`http://localhost:3001/api/autobuses/${id}`);
        alert("Autobús eliminado correctamente");
        this.cargarAutobuses();
      } catch (error) {
        alert("Error al eliminar el autobús.");
      }
    },
    abrirModalAgregar() {
      this.autobusFormulario = { id_empresa: "", id_chofer: "", placa: "", capacidad: "" };
      this.esEdicion = false;
      this.mostrarModal = true;
    },
    editarAutobus(autobus) {
      this.autobusFormulario = { ...autobus };
      this.esEdicion = true;
      this.mostrarModal = true;
    },
    async guardarAutobus() {
      try {
        if (this.esEdicion) {
          await axios.put(`http://localhost:3001/api/autobuses/${this.autobusFormulario.id_bus}`, this.autobusFormulario);
        } else {
          await axios.post("http://localhost:3001/api/autobuses", this.autobusFormulario);
        }
        alert("Operación exitosa");
        this.cerrarModal();
        this.cargarAutobuses();
      } catch (error) {
        alert("Error al guardar el autobús.");
      }
    },
    cerrarModal() {
      this.mostrarModal = false;
    }
  },
  mounted() {
    this.cargarAutobuses();
    this.cargarEmpresasYChoferes();
  }
};
</script>



<style>
.botones-acciones {
  display: flex;
  gap: 10px;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 15px;
}
</style>
