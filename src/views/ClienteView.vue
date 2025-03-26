<template>
  <div class="container">
    <h1>Gestión de Clientes</h1>

    <!-- Opciones de Visualización -->
    <div class="options-container">
      <label>Mostrar:</label>
      <select v-model="itemsPorPagina">
        <option value="5">5</option>
        <option value="todos">Todos</option>
      </select>
      <input v-model="busquedaId" type="number" placeholder="Buscar por ID" />
      <button class="btn btn-primary" @click="buscarCliente">Buscar</button>
      <button class="btn btn-secondary" @click="mostrarTodas">Mostrar Todos</button>
    </div>

    <!-- Botón Agregar Cliente -->
    <button class="btn btn-success" @click="mostrarModalAgregar = true">Agregar Cliente</button>

    <!-- Tabla de Clientes -->
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cliente, index) in clientesPaginados" :key="cliente.id_cliente" @mouseover="filaSeleccionada = index" @mouseleave="filaSeleccionada = null" :class="{ 'fila-seleccionada': filaSeleccionada === index }">
          <td>{{ cliente.id_cliente }}</td>
          <td>{{ cliente.nombre_completo }}</td>
          <td>
            <button class="btn btn-warning" @click="editarCliente(cliente)">Editar</button>
            <button class="btn btn-danger" @click="eliminarCliente(cliente.id_cliente)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Agregar Cliente -->
    <div v-if="mostrarModalAgregar" class="modal">
      <div class="modal-content">
        <h2>Agregar Cliente</h2>
        
        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="nuevoCliente.nombre_completo" type="text" placeholder="Nombre Completo" @input="validarNombre" />
        </div>

        <div class="button-group">
          <button class="btn btn-success" @click="agregarCliente">Guardar</button>
          <button class="btn btn-secondary" @click="cerrarModalAgregar">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal Editar Cliente -->
    <div v-if="clienteEditando" class="modal">
      <div class="modal-content">
        <h2>Editar Cliente</h2>

        <div class="form-group">
          <label>Nombre:</label>
          <input v-model="clienteEditando.nombre_completo" type="text" placeholder="Nuevo Nombre" @input="validarNombre" />
        </div>

        <div class="button-group">
          <button class="btn btn-warning" @click="guardarEdicion">Guardar Cambios</button>
          <button class="btn btn-secondary" @click="clienteEditando = null">Cancelar</button>
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
      clientes: [],
      clienteEditando: null,
      filaSeleccionada: null,
      busquedaId: "",
      mostrarModalAgregar: false,
      nuevoCliente: { nombre_completo: "" },
      itemsPorPagina: "5",
    };
  },
  computed: {
    clientesPaginados() {
      // Ordenar por ID descendente para que los más nuevos aparezcan primero
      const clientesOrdenados = [...this.clientes].sort((a, b) => b.id_cliente - a.id_cliente);
      return this.itemsPorPagina === "todos" ? clientesOrdenados : clientesOrdenados.slice(0, Number(this.itemsPorPagina));
    },
  },
  methods: {
    async cargarClientes() {
      try {
        const response = await axios.get("http://localhost:3001/clientes");
        // Ordenar por ID descendente para que los más nuevos aparezcan primero
        this.clientes = response.data.sort((a, b) => b.id_cliente - a.id_cliente);
      } catch (error) {
        console.error("❌ Error al obtener clientes:", error);
      }
    },
    mostrarTodas() {
      this.itemsPorPagina = "todos";
      this.cargarClientes();
    },
    async buscarCliente() {
      if (!this.busquedaId) {
        alert("Ingrese un ID válido");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/clientes/${this.busquedaId}`);
        this.clientes = [response.data];
      } catch (error) {
        console.error("❌ Error al buscar cliente:", error);
        alert("Cliente no encontrado");
      }
    },
    async agregarCliente() {
      if (!this.nuevoCliente.nombre_completo.trim()) {
        alert("El nombre es obligatorio");
        return;
      }
      try {
        const response = await axios.post("http://localhost:3001/clientes", this.nuevoCliente);
        alert("Cliente agregado correctamente");
        
        // Agregar el nuevo cliente al principio del array
        this.clientes.unshift(response.data);
        
        this.nuevoCliente.nombre_completo = ""; // Limpiar campo después de agregar
        this.cerrarModalAgregar();
      } catch (error) {
        console.error("❌ Error al agregar cliente:", error);
        alert("Error al agregar cliente.");
      }
    },
    editarCliente(cliente) {
      this.clienteEditando = { ...cliente };
    },
    async guardarEdicion() {
      if (!this.clienteEditando.nombre_completo.trim()) {
        alert("El nombre es obligatorio");
        return;
      }
      try {
        await axios.put(`http://localhost:3001/clientes/${this.clienteEditando.id_cliente}`, this.clienteEditando);
        alert("Cliente actualizado correctamente");
        this.clienteEditando = null;
        this.cargarClientes();
      } catch (error) {
        console.error("❌ Error al actualizar cliente:", error);
        alert("Error al actualizar cliente.");
      }
    },
    async eliminarCliente(id) {
      if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
      try {
        await axios.delete(`http://localhost:3001/clientes/${id}`);
        alert("Cliente eliminado correctamente");
        this.cargarClientes();
      } catch (error) {
        console.error("❌ Error al eliminar cliente:", error);
        alert("Error al eliminar cliente.");
      }
    },
    validarNombre() {
      this.nuevoCliente.nombre_completo = this.nuevoCliente.nombre_completo.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ\s]/g, "");
      if (this.clienteEditando) {
        this.clienteEditando.nombre_completo = this.clienteEditando.nombre_completo.replace(/[^a-zA-ZÁÉÍÓÚáéíóúñÑ\s]/g, "");
      }
    },
    cerrarModalAgregar() {
      this.mostrarModalAgregar = false;
      this.nuevoCliente = { nombre_completo: "" }; // Limpiar al cerrar
    }
  },
  mounted() {
    this.cargarClientes();
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
