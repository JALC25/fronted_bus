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
            <select v-model="autobusFormulario.id_empresa" required>
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
            <input v-model="autobusFormulario.placa" type="text" required @input="formatearPlaca" />
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
      autobusFormulario: { 
        id_empresa: "", 
        id_chofer: "", 
        placa: "", 
        capacidad: 30 
      },
      itemsPorPagina: "5",
    };
  },
  computed: {
    autobusesPaginados() {
      // Ordenar por ID descendente para que los más nuevos aparezcan primero
      const autobusesOrdenados = [...this.autobuses].sort((a, b) => b.id_bus - a.id_bus);
      return this.itemsPorPagina === "todos" ? autobusesOrdenados : autobusesOrdenados.slice(0, Number(this.itemsPorPagina));
    },
  },
  methods: {
    formatearPlaca() {
      this.autobusFormulario.placa = this.autobusFormulario.placa.toUpperCase().replace(/\s/g, '');
    },
    async cargarAutobuses() {
      try {
        const response = await axios.get("http://localhost:3001/api/autobuses");
        this.autobuses = response.data.sort((a, b) => b.id_bus - a.id_bus) || [];
      } catch (error) {
        console.error("Error al cargar autobuses:", error);
        alert("Error al cargar los autobuses.");
      }
    },
    async cargarEmpresasYChoferes() {
      try {
        const [empresasRes, choferesRes] = await Promise.all([
          axios.get("http://localhost:3001/empresas"),
          axios.get("http://localhost:3001/choferes")
        ]);
        
        this.empresas = empresasRes.data || [];
        this.choferes = choferesRes.data || [];
      } catch (error) {
        console.error("Error al cargar empresas y choferes:", error);
        alert("Error al cargar empresas y choferes.");
      }
    },
    obtenerNombreEmpresa(idEmpresa) {
      const empresa = this.empresas.find(emp => emp.id_empresa === idEmpresa);
      return empresa ? empresa.nombre_empresa : "Desconocido";
    },
    obtenerNombreChofer(idChofer) {
      if (!idChofer) return "Sin asignar";
      const chofer = this.choferes.find(ch => ch.id_chofer === idChofer);
      return chofer ? chofer.nombre : "Chofer no encontrado";
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
        console.error("Error al buscar autobús:", error);
        alert("Autobús no encontrado");
      }
    },
    async eliminarAutobus(id) {
      if (!confirm("¿Estás seguro de eliminar este autobús?")) return;
      try {
        await axios.delete(`http://localhost:3001/api/autobuses/${id}`);
        // Eliminar el autobús del array local sin recargar
        this.autobuses = this.autobuses.filter(autobus => autobus.id_bus !== id);
        alert("Autobús eliminado correctamente");
      } catch (error) {
        console.error("Error al eliminar autobús:", error);
        alert("Error al eliminar el autobús.");
      }
    },
    abrirModalAgregar() {
      this.autobusFormulario = { 
        id_empresa: "", 
        id_chofer: "", 
        placa: "", 
        capacidad: 30 
      };
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
        if (!this.autobusFormulario.id_empresa || !this.autobusFormulario.placa || !this.autobusFormulario.capacidad) {
          alert("Empresa, placa y capacidad son campos obligatorios");
          return;
        }

        if (this.esEdicion) {
          const response = await axios.put(
            `http://localhost:3001/api/autobuses/${this.autobusFormulario.id_bus}`, 
            this.autobusFormulario
          );
          // Actualizar el autobús en el array local
          this.autobuses = this.autobuses.map(autobus => 
            autobus.id_bus === this.autobusFormulario.id_bus ? response.data : autobus
          );
          alert("Autobús actualizado correctamente");
        } else {
          const response = await axios.post(
            "http://localhost:3001/api/autobuses", 
            this.autobusFormulario
          );
          // Agregar el nuevo autobús al principio del array local
          this.autobuses.unshift(response.data);
          alert("Autobús agregado correctamente");
        }
        
        this.cerrarModal();
      } catch (error) {
        console.error("Error al guardar autobús:", error);
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
