<template>
  <div class="container">
    <h1>Gestión de Asientos</h1>

    <!-- Opciones de Visualización -->
    <div class="options-container">
      <label>Mostrar:</label>
      <select v-model="itemsPorPagina">
        <option value="5">5</option>
        <option value="todos">Todos</option>
      </select>
      <input v-model="busquedaId" type="number" placeholder="Buscar por ID" />
      <button class="btn btn-primary" @click="buscarAsiento">Buscar</button>
      <button class="btn btn-secondary" @click="mostrarTodosLosAsientos">Mostrar Todos</button>
    </div>

    <!-- Botón Agregar Asiento -->
    <button class="btn btn-success" @click="abrirModalAgregar">Agregar Asiento</button>

    <!-- Tabla de Asientos -->
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Horario</th>
          <th>Autobús</th>
          <th>Número de Asiento</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="asiento in asientosPaginados" :key="asiento.id_asiento">
          <td>{{ asiento.id_asiento }}</td>
          <td>{{ obtenerFechaHorario(asiento.id_horario) }}</td>
          <td>{{ obtenerPlacaAutobus(asiento.id_bus) }}</td>
          <td>{{ asiento.numero_asiento }}</td>
          <td>{{ asiento.estado }}</td>
          <td>
            <button class="btn btn-warning" @click="editarAsiento(asiento)">Editar</button>
            <button class="btn btn-danger" @click="eliminarAsiento(asiento.id_asiento)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Agregar/Editar Asiento -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-content">
        <h2>{{ esEdicion ? 'Editar Asiento' : 'Agregar Asiento' }}</h2>

        <div class="form-group">
          <label>Horario:</label>
          <select v-model="asientoFormulario.id_horario" required>
            <option disabled value="">Seleccione un horario</option>
            <option v-for="horario in horarios" :key="horario.id_horario" :value="horario.id_horario">
              {{ horario.fecha_salida }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Autobús:</label>
          <select v-model="asientoFormulario.id_bus" required>
            <option disabled value="">Seleccione un autobús</option>
            <option v-for="autobus in autobuses" :key="autobus.id_bus" :value="autobus.id_bus">
              {{ autobus.placa }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Número de Asiento:</label>
          <input v-model="asientoFormulario.numero_asiento" type="number" min="1" required />
        </div>

        <div class="form-group">
          <label>Estado:</label>
          <select v-model="asientoFormulario.estado" required>
            <option value="Disponible">Disponible</option>
            <option value="Ocupado">Ocupado</option>
            <option value="Reservado">Reservado</option>
          </select>
        </div>

        <div class="error-message" v-if="errorMensaje">{{ errorMensaje }}</div>

        <div class="button-group">
          <button class="btn btn-success" @click="guardarAsiento">Guardar</button>
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
      asientos: [],
      horarios: [],
      autobuses: [],
      busquedaId: "",
      mostrarModal: false,
      esEdicion: false,
      errorMensaje: "",
      asientoFormulario: { id_asiento: "", id_horario: "", id_bus: "", numero_asiento: "", estado: "Disponible" },
      itemsPorPagina: "5",
    };
  },
  computed: {
    asientosPaginados() {
      return this.itemsPorPagina === "todos" ? this.asientos : this.asientos.slice(0, Number(this.itemsPorPagina));
    },
  },
  methods: {
    async cargarAsientos() {
      try {
        const response = await axios.get("http://localhost:3001/asientos");
        this.asientos = response.data;
      } catch (error) {
        alert("Error al cargar los asientos.");
      }
    },
    async mostrarTodosLosAsientos() {
      this.busquedaId = ""; // Limpia la búsqueda
      await this.cargarAsientos();
    },
    async cargarHorariosYAutobuses() {
      try {
        const horariosRes = await axios.get("http://localhost:3001/horarios");
        const autobusesRes = await axios.get("http://localhost:3001/api/autobuses");
        this.horarios = horariosRes.data;
        this.autobuses = autobusesRes.data;
      } catch (error) {
        alert("Error al cargar horarios y autobuses.");
      }
    },
    obtenerFechaHorario(id_horario) {
      const horario = this.horarios.find(h => h.id_horario === id_horario);
      return horario ? horario.fecha_salida : "Desconocido";
    },
    obtenerPlacaAutobus(id_bus) {
      const autobus = this.autobuses.find(a => a.id_bus === id_bus);
      return autobus ? autobus.placa : "Desconocido";
    },
    async buscarAsiento() {
      if (!this.busquedaId) {
        alert("Ingrese un ID válido");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/asientos/${this.busquedaId}`);
        this.asientos = [response.data];
      } catch (error) {
        alert("Asiento no encontrado");
      }
    },
    async eliminarAsiento(id) {
      if (!confirm("¿Estás seguro de eliminar este asiento?")) return;
      try {
        await axios.delete(`http://localhost:3001/asientos/${id}`);
        alert("Asiento eliminado correctamente");
        this.cargarAsientos();
      } catch (error) {
        alert("Error al eliminar asiento.");
      }
    },
    abrirModalAgregar() {
      this.errorMensaje = "";
      this.asientoFormulario = { id_horario: "", id_bus: "", numero_asiento: "", estado: "Disponible" };
      this.esEdicion = false;
      this.mostrarModal = true;
      this.cargarHorariosYAutobuses();
    },
    editarAsiento(asiento) {
      this.errorMensaje = "";
      this.asientoFormulario = { ...asiento };
      this.esEdicion = true;
      this.mostrarModal = true;
    },
    async guardarAsiento() {
      this.errorMensaje = "";
      if (!this.asientoFormulario.id_horario || !this.asientoFormulario.id_bus || !this.asientoFormulario.numero_asiento) {
        this.errorMensaje = "Todos los campos son obligatorios.";
        return;
      }
      try {
        if (this.esEdicion) {
          await axios.put(`http://localhost:3001/asientos/${this.asientoFormulario.id_asiento}`, this.asientoFormulario);
          alert("Asiento actualizado correctamente.");
        } else {
          await axios.post("http://localhost:3001/asientos", this.asientoFormulario);
          alert("Asiento agregado correctamente.");
        }
        this.cerrarModal();
        this.cargarAsientos();
      } catch (error) {
        this.errorMensaje = error.response.data.error || "Error al guardar el asiento.";
      }
    },
    cerrarModal() {
      this.mostrarModal = false;
    }
  },
  mounted() {
    this.cargarAsientos();
    this.cargarHorariosYAutobuses();
  }
};
</script>
