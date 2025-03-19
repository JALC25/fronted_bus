<template>
  <div class="container">
    <h1>Gestión de Horarios</h1>

    <!-- Opciones de Visualización -->
    <div class="options-container">
      <label>Mostrar:</label>
      <select v-model="itemsPorPagina">
        <option value="5">5</option>
        <option value="todos">Todos</option>
      </select>
      <input v-model="busquedaId" type="number" placeholder="Buscar por ID" />
      <button class="btn btn-primary" @click="buscarHorario">Buscar</button>
      <button class="btn btn-secondary" @click="cargarHorarios">Mostrar Todos</button>
    </div>

    <!-- Botón Agregar Horario -->
    <button class="btn btn-success" @click="abrirModalAgregar">Agregar Horario</button>

    <!-- Tabla de Horarios -->
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Origen</th>
          <th>Placa</th>
          <th>Fecha Salida</th>
          <th>Fecha Llegada</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="horario in horariosPaginados" :key="horario.id_horario">
          <td>{{ horario.id_horario }}</td>
          <td>{{ horario.Ruta?.origen || horario.Rutum?.origen || "No asignado" }}</td>
          <td>{{ horario.Autobus?.placa || "No asignado" }}</td>
          <td>{{ horario.fecha_salida }}</td>
          <td>{{ horario.fecha_llegada }}</td>
          <td>
            <button class="btn btn-warning" @click="editarHorario(horario)">Editar</button>
            <button class="btn btn-danger" @click="eliminarHorario(horario.id_horario)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Agregar/Edit Horario -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-content">
        <h2>{{ esEdicion ? 'Editar Horario' : 'Agregar Horario' }}</h2>

        <div class="form-group">
          <label>Ruta:</label>
          <select v-model="horarioFormulario.id_ruta" required>
            <option disabled value="">Seleccione una ruta</option>
            <option v-for="ruta in rutas" :key="ruta.id_ruta" :value="ruta.id_ruta">
              {{ ruta.origen }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Autobús:</label>
          <select v-model="horarioFormulario.id_bus" required>
            <option disabled value="">Seleccione un autobús</option>
            <option v-for="autobus in autobuses" :key="autobus.id_bus" :value="autobus.id_bus">
              {{ autobus.placa }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Fecha de Salida:</label>
          <input v-model="horarioFormulario.fecha_salida" type="date" required />
        </div>

        <div class="form-group">
          <label>Fecha de Llegada:</label>
          <input v-model="horarioFormulario.fecha_llegada" type="date" required />
        </div>

        <div class="button-group">
          <button class="btn btn-success" @click="guardarHorario">Guardar</button>
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
      horarios: [],
      rutas: [],
      autobuses: [],
      busquedaId: "",
      mostrarModal: false,
      esEdicion: false,
      horarioFormulario: { id_ruta: "", id_bus: "", fecha_salida: "", fecha_llegada: "" },
      itemsPorPagina: "5",
    };
  },
  computed: {
    horariosPaginados() {
      return this.itemsPorPagina === "todos" ? this.horarios : this.horarios.slice(0, Number(this.itemsPorPagina));
    },
  },
  methods: {
    async cargarHorarios() {
      try {
        const response = await axios.get("http://localhost:3001/horarios");
        this.horarios = response.data;
      } catch (error) {
        console.error("❌ Error al cargar horarios:", error);
      }
    },
    async cargarRutasYAutobuses() {
      try {
        const [rutasResponse, autobusesResponse] = await Promise.all([
          axios.get("http://localhost:3001/rutas"),
          axios.get("http://localhost:3001/api/autobuses")
        ]);
        this.rutas = rutasResponse.data;
        this.autobuses = autobusesResponse.data;
      } catch (error) {
        console.error("❌ Error al cargar rutas y autobuses:", error);
      }
    },
    async buscarHorario() {
      if (!this.busquedaId) {
        alert("Ingrese un ID válido");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/horarios/${this.busquedaId}`);
        this.horarios = [response.data];
      } catch (error) {
        alert("Horario no encontrado");
      }
    },
    async eliminarHorario(id) {
      if (!confirm("¿Estás seguro de eliminar este horario?")) return;
      try {
        await axios.delete(`http://localhost:3001/horarios/${id}`);
        alert("Horario eliminado correctamente");
        this.cargarHorarios();
      } catch (error) {
        alert("Error al eliminar el horario.");
      }
    },
    abrirModalAgregar() {
      this.cargarRutasYAutobuses();
      this.horarioFormulario = { id_ruta: "", id_bus: "", fecha_salida: "", fecha_llegada: "" };
      this.esEdicion = false;
      this.mostrarModal = true;
    },
    editarHorario(horario) {
      this.horarioFormulario = { ...horario };
      this.esEdicion = true;
      this.mostrarModal = true;
    },
    async guardarHorario() {
      try {
        if (this.esEdicion) {
          await axios.put(`http://localhost:3001/horarios/${this.horarioFormulario.id_horario}`, this.horarioFormulario);
          alert("Horario actualizado correctamente.");
        } else {
          await axios.post("http://localhost:3001/horarios", this.horarioFormulario);
          alert("Horario agregado correctamente.");
        }
        this.cerrarModal();
        this.cargarHorarios();
      } catch (error) {
        alert("Error al guardar el horario.");
      }
    },
    cerrarModal() {
      this.mostrarModal = false;
      this.horarioFormulario = { id_ruta: "", id_bus: "", fecha_salida: "", fecha_llegada: "" };
    }
  },
  mounted() {
    this.cargarHorarios();
    this.cargarRutasYAutobuses();
  }
};
</script>
