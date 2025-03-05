<template>
  <div class="container">
    <h1>Gestión de Empresas</h1>

    <!-- Opciones de Visualización -->
    <div class="options-container">
      <label>Mostrar:</label>
      <select v-model="itemsPorPagina">
        <option value="5">5</option>
        <option value="todos">Todos</option>
      </select>
      <input v-model="busquedaId" type="number" placeholder="Buscar por ID" />
      <button class="btn btn-primary" @click="buscarEmpresa">Buscar</button>
      <button class="btn btn-secondary" @click="mostrarTodas">Mostrar Todos</button>
    </div>

    <!-- Botón Agregar Empresa -->
    <button class="btn btn-success" @click="mostrarModalAgregar = true">Agregar Empresa</button>

    <!-- Tabla de Empresas -->
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Dirección</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(empresa, index) in empresasPaginadas" :key="empresa.id_empresa" @mouseover="filaSeleccionada = index" @mouseleave="filaSeleccionada = null" :class="{ 'fila-seleccionada': filaSeleccionada === index }">
          <td>{{ empresa.id_empresa }}</td>
          <td>{{ empresa.nombre_empresa }}</td>
          <td>{{ empresa.direccion }}</td>
          <td>{{ empresa.telefono_contacto }}</td>
          <td>{{ empresa.email_contacto }}</td>
          <td>
            <button class="btn btn-warning" @click="editarEmpresa(empresa)">Editar</button>
            <button class="btn btn-danger" @click="eliminarEmpresa(empresa.id_empresa)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Agregar Empresa -->
    <div v-if="mostrarModalAgregar" class="modal">
      <div class="modal-content">
        <h2>Agregar Empresa</h2>
        
        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="nuevaEmpresa.nombre_empresa" type="text" placeholder="Nombre Empresa" @input="validarNombre" />
        </div>

        <div class="form-group">
          <label>Dirección:</label>
          <input v-model="nuevaEmpresa.direccion" type="text" placeholder="Dirección" />
        </div>

        <div class="form-group">
          <label>Teléfono:</label>
          <input v-model="nuevaEmpresa.telefono_contacto" type="text" placeholder="Teléfono (8 dígitos)" @input="validarTelefono" />
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input v-model="nuevaEmpresa.email_contacto" type="email" placeholder="Correo Electrónico" />
        </div>

        <div class="button-group">
          <button class="btn btn-success" @click="agregarEmpresa">Guardar</button>
          <button class="btn btn-secondary" @click="cerrarModalAgregar">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal Editar Empresa -->
    <div v-if="empresaEditando" class="modal">
      <div class="modal-content">
        <h2>Editar Empresa</h2>

        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="empresaEditando.nombre_empresa" type="text" placeholder="Nombre Empresa" @input="validarNombre" />
        </div>

        <div class="form-group">
          <label>Dirección:</label>
          <input v-model="empresaEditando.direccion" type="text" placeholder="Dirección" />
        </div>

        <div class="form-group">
          <label>Teléfono:</label>
          <input v-model="empresaEditando.telefono_contacto" type="text" placeholder="Teléfono (8 dígitos)" @input="validarTelefono" />
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input v-model="empresaEditando.email_contacto" type="email" placeholder="Correo Electrónico" />
        </div>

        <div class="button-group">
          <button class="btn btn-warning" @click="guardarEdicion">Guardar Cambios</button>
          <button class="btn btn-secondary" @click="empresaEditando = null">Cancelar</button>
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
      empresas: [],
      empresaEditando: null,
      filaSeleccionada: null,
      busquedaId: "",
      mostrarModalAgregar: false,
      nuevaEmpresa: { nombre_empresa: "", direccion: "", telefono_contacto: "", email_contacto: "" },
      itemsPorPagina: "5",
    };
  },
  computed: {
    empresasPaginadas() {
      return this.itemsPorPagina === "todos" ? this.empresas : this.empresas.slice(0, Number(this.itemsPorPagina));
    },
  },
  methods: {
    async cargarEmpresas() {
      try {
        const response = await axios.get("http://localhost:3001/empresas");
        this.empresas = response.data;
      } catch (error) {
        console.error("❌ Error al obtener empresas:", error);
      }
    },
    mostrarTodas() {
      this.itemsPorPagina = "todos";
      this.cargarEmpresas();
    },
    async buscarEmpresa() {
      if (!this.busquedaId) return alert("Ingrese un ID válido");
      try {
        const response = await axios.get(`http://localhost:3001/empresas/${this.busquedaId}`);
        this.empresas = [response.data];
      } catch (error) {
        alert("Empresa no encontrada");
      }
    },
    async agregarEmpresa() {
      try {
        await axios.post("http://localhost:3001/empresas", this.nuevaEmpresa);
        alert("Empresa agregada correctamente");
        this.cerrarModalAgregar();
        this.cargarEmpresas();
      } catch (error) {
        alert(error.response.data.error);
      }
    },
    editarEmpresa(empresa) {
      this.empresaEditando = { ...empresa };
    },
    async guardarEdicion() {
      try {
        await axios.put(`http://localhost:3001/empresas/${this.empresaEditando.id_empresa}`, this.empresaEditando);
        alert("Empresa actualizada correctamente");
        this.empresaEditando = null;
        this.cargarEmpresas();
      } catch (error) {
        alert(error.response.data.error);
      }
    },
    async eliminarEmpresa(id) {
      if (!confirm("¿Estás seguro de eliminar esta empresa?")) return;
      try {
        await axios.delete(`http://localhost:3001/empresas/${id}`);
        alert("Empresa eliminada correctamente");
        this.cargarEmpresas();
      } catch (error) {
        alert(error.response.data.error);
      }
    },
    validarNombre(event) {
      event.target.value = event.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ\s]/g, "");
    },
    validarTelefono(event) {
      event.target.value = event.target.value.replace(/\D/g, "").slice(0, 8);
    },
    cerrarModalAgregar() {
      this.mostrarModalAgregar = false;
      this.nuevaEmpresa = { nombre_empresa: "", direccion: "", telefono_contacto: "", email_contacto: "" };
    }
  },
  mounted() {
    this.cargarEmpresas();
  }
};
</script>

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
}
.fila-seleccionada {
  background: #d1ecf1 !important;
}

/* Estilo para los botones verticales */
td button {
  display: block; /* Hace que los botones se muestren uno debajo del otro */
  margin: 5px auto; /* Centra los botones y agrega espacio entre ellos */
  width: 80px; /* Ancho fijo para los botones (opcional) */
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
</style>