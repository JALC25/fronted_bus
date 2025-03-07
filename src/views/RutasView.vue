<template>
  <div class="container">
    <h1>Gestión de Rutas</h1>

    <!-- Opciones de Visualización -->
    <div class="options-container">
      <label>Mostrar:</label>
      <select v-model="itemsPorPagina">
        <option value="5">5</option>
        <option value="todos">Todos</option>
      </select>
      <input v-model="busquedaId" type="number" placeholder="Buscar por ID" />
      <button class="btn btn-primary" @click="buscarRuta">Buscar</button>
      <button class="btn btn-secondary" @click="cargarRutas">Mostrar Todos</button>
    </div>

    <!-- Botón Agregar Ruta -->
    <button class="btn btn-success" @click="abrirModalAgregar">Agregar Ruta</button>

    <!-- Tabla de Rutas -->
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Empresa</th>
          <th>Origen</th>
          <th>Destino</th>
          <th>Distancia (km)</th>
          <th>Duración</th>
          <th>Precio Base (Lp)</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="ruta in rutasPaginadas" :key="ruta.id_ruta">
          <td>{{ ruta.id_ruta }}</td>
          <td>{{ ruta.Empresa ? ruta.Empresa.nombre_empresa : "No asignada" }}</td>
          <td>{{ ruta.origen }}</td>
          <td>{{ ruta.destino }}</td>
          <td>{{ ruta.distancia }}</td>
          <td>{{ ruta.duracion }}</td>
          <td>{{ ruta.precio_base }}</td>
          <td>
            <button class="btn btn-warning" @click="editarRuta(ruta)">Editar</button>
            <button class="btn btn-danger" @click="eliminarRuta(ruta.id_ruta)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Agregar/Editar Ruta -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-content">
        <h2>{{ esEdicion ? "Editar Ruta" : "Agregar Ruta" }}</h2>

        <div class="form-group">
          <label>Empresa:</label>
          <select v-model="rutaFormulario.id_empresa" required>
            <option disabled value="">Seleccione una empresa</option>
            <option v-for="empresa in empresas" :key="empresa.id_empresa" :value="empresa.id_empresa">
              {{ empresa.nombre_empresa }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Origen:</label>
          <input v-model="rutaFormulario.origen" type="text" @input="validarTexto('origen')" required />
        </div>

        <div class="form-group">
          <label>Destino:</label>
          <input v-model="rutaFormulario.destino" type="text" @input="validarTexto('destino')" required />
        </div>

        <div class="form-group">
          <label>Distancia (km):</label>
          <input v-model="rutaFormulario.distancia" type="number" min="1" required />
        </div>

        <div class="form-group">
          <label>Duración:</label>
          <input v-model="rutaFormulario.duracion" type="text" required />
        </div>

        <div class="form-group">
          <label>Precio Base (Lp):</label>
          <input v-model="rutaFormulario.precio_base" type="number" min="0" required />
        </div>

        <div class="button-group">
          <button class="btn btn-success" @click="guardarRuta">Guardar</button>
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
      rutas: [],
      empresas: [],
      busquedaId: "",
      mostrarModal: false,
      esEdicion: false,
      rutaFormulario: { id_empresa: "", origen: "", destino: "", distancia: "", duracion: "", precio_base: "" },
      itemsPorPagina: "5",
    };
  },
  computed: {
    rutasPaginadas() {
      return this.itemsPorPagina === "todos" ? this.rutas : this.rutas.slice(0, Number(this.itemsPorPagina));
    },
  },
  methods: {
    validarTexto(campo) {
      this.rutaFormulario[campo] = this.rutaFormulario[campo].replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ\s]/g, "");
    },
    async cargarRutas() {
      try {
        const response = await axios.get("http://localhost:3001/rutas");
        this.rutas = response.data;
      } catch (error) {
        alert("Error al cargar las rutas.");
      }
    },
    async cargarEmpresas() {
      try {
        const response = await axios.get("http://localhost:3001/empresas");
        this.empresas = response.data;
      } catch (error) {
        alert("Error al cargar las empresas.");
      }
    },
    async buscarRuta() {
      if (!this.busquedaId) {
        alert("Ingrese un ID válido");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/rutas/${this.busquedaId}`);
        this.rutas = [response.data];
      } catch (error) {
        alert("Ruta no encontrada");
      }
    },
    async eliminarRuta(id) {
      if (!confirm("¿Estás seguro de eliminar esta ruta?")) return;
      try {
        await axios.delete(`http://localhost:3001/rutas/${id}`);
        alert("Ruta eliminada correctamente");
        this.cargarRutas();
      } catch (error) {
        alert("Error al eliminar la ruta.");
      }
    },
    abrirModalAgregar() {
      this.rutaFormulario = { id_empresa: "", origen: "", destino: "", distancia: "", duracion: "", precio_base: "" };
      this.esEdicion = false;
      this.mostrarModal = true;
    },
    editarRuta(ruta) {
      this.rutaFormulario = { ...ruta };
      this.esEdicion = true;
      this.mostrarModal = true;
    },
    async guardarRuta() {
      try {
        if (!this.rutaFormulario.id_empresa || !this.rutaFormulario.origen || !this.rutaFormulario.destino || !this.rutaFormulario.distancia || !this.rutaFormulario.duracion || !this.rutaFormulario.precio_base) {
          alert("Todos los campos son obligatorios");
          return;
        }

        if (this.esEdicion) {
          await axios.put(`http://localhost:3001/rutas/${this.rutaFormulario.id_ruta}`, this.rutaFormulario);
          alert("Ruta actualizada correctamente.");
        } else {
          await axios.post("http://localhost:3001/rutas", this.rutaFormulario);
          alert("Ruta agregada correctamente.");
        }

        this.cerrarModal();
        this.cargarRutas();
      } catch (error) {
        alert("Error al guardar la ruta.");
      }
    },
    cerrarModal() {
      this.mostrarModal = false;
    }
  },
  mounted() {
    this.cargarRutas();
    this.cargarEmpresas();
  }
};
</script>
