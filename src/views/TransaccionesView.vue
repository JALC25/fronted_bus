<template>
  <div class="container">
    <h1>Gestión de Transacciones</h1>

    <!-- Opciones de Visualización -->
    <div class="options-container">
      <label>Mostrar:</label>
      <select v-model="itemsPorPagina">
        <option value="5">5</option>
        <option value="todos">Todos</option>
      </select>
      <input v-model="busquedaId" type="number" placeholder="Buscar por ID" />
      <button class="btn btn-primary" @click="buscarTransaccion">Buscar</button>
      <button class="btn btn-secondary" @click="cargarDatos">Mostrar Todos</button>
    </div>

    <!-- Botón Agregar Transacción -->
    <button class="btn btn-success" @click="abrirModal(false)">Agregar Transacción</button>

    <!-- Tabla de Transacciones -->
    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Horario</th>
            <th>Cliente</th>
            <th>Bus</th>
            <th>Ruta</th>
            <th>Asiento</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Fecha Compra</th>
            <th>Método Pago</th>
            <th>Código Ticket</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaccion in transaccionesFiltradas" :key="transaccion.id_transaccion">
            <td>{{ transaccion.id_transaccion }}</td>
            <td>{{ transaccion.Horario?.fecha_salida || "No asignado" }}</td>
            <td>{{ transaccion.Cliente?.nombre_completo || "Sin cliente" }}</td>
            <td>{{ transaccion.Bus?.placa || "No asignado" }}</td>
            <td>{{ transaccion.Ruta?.origen || "No asignado" }}</td>
            <td>{{ transaccion.Asiento?.numero_asiento || "No asignado" }}</td>
            <td>{{ transaccion.precio }}</td>
            <td>{{ transaccion.estado }}</td>
            <td>{{ transaccion.fecha_compra }}</td>
            <td>{{ transaccion.metodo_pago }}</td>
            <td>{{ transaccion.codigo_ticket }}</td>
            <td>
              <button class="btn btn-warning" @click="abrirModal(true, transaccion)">Editar</button>
              <button class="btn btn-danger" @click="eliminarTransaccion(transaccion.id_transaccion)">Eliminar</button>
              <button class="btn btn-info" @click="imprimirTransaccion(transaccion)">Imprimir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Agregar/Editar Transacción -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-content" :class="{ 'modal-content-small': mostrarCamposTarjetaFlag }">
        <h2>{{ esEdicion ? 'Editar Transacción' : 'Agregar Transacción' }}</h2>

        <div v-if="mensajeError" class="error-message">{{ mensajeError }}</div>

        <!-- Campos del formulario -->
        <div class="form-group">
          <label>Horario:</label>
          <select v-model="transaccionFormulario.id_horario">
            <option value="" disabled>Seleccione un horario</option>
            <option v-for="horario in horarios" :key="horario.id_horario" :value="horario.id_horario">
              {{ horario.fecha_salida }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Cliente:</label>
          <select v-model="transaccionFormulario.id_cliente">
            <option value="">Sin cliente asignado</option>
            <option v-for="cliente in clientes" :key="cliente.id_cliente" :value="cliente.id_cliente">
              {{ cliente.nombre_completo }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Bus:</label>
          <select v-model="transaccionFormulario.id_bus">
            <option value="" disabled>Seleccione un bus</option>
            <option v-for="autobus in autobuses" :key="autobus.id_bus" :value="autobus.id_bus">
              {{ autobus.placa }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Ruta:</label>
          <select v-model="transaccionFormulario.id_ruta">
            <option value="" disabled>Seleccione una ruta</option>
            <option v-for="ruta in rutas" :key="ruta.id_ruta" :value="ruta.id_ruta">
              {{ ruta.origen }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Asiento:</label>
          <select v-model="transaccionFormulario.id_asiento">
            <option value="" disabled>Seleccione un asiento</option>
            <option v-for="asiento in asientos" :key="asiento.id_asiento" :value="asiento.id_asiento">
              {{ asiento.numero_asiento }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Precio:</label>
          <input v-model="transaccionFormulario.precio" type="number" />
        </div>

        <div class="form-group">
          <label>Estado:</label>
          <select v-model="transaccionFormulario.estado">
            <option value="Reservado">Reservado</option>
            <option value="Comprado">Comprado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div class="form-group">
          <label>Método de Pago:</label>
          <select v-model="transaccionFormulario.metodo_pago" @change="mostrarCamposTarjeta">
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </div>

        <!-- Campos de la tarjeta (solo visibles si el método de pago es "Tarjeta") -->
        <div v-if="mostrarCamposTarjetaFlag" class="form-group">
          <label>Número de Tarjeta:</label>
          <input v-model="transaccionFormulario.numero_tarjeta" type="text" placeholder="1234 5678 9012 3456" />
        </div>

        <div v-if="mostrarCamposTarjetaFlag" class="form-group">
          <label>Nombre del Titular:</label>
          <input v-model="transaccionFormulario.nombre_titular" type="text" placeholder="Juan Pérez" />
        </div>

        <div v-if="mostrarCamposTarjetaFlag" class="form-group">
          <label>Fecha de Expiración:</label>
          <input v-model="transaccionFormulario.fecha_expiracion" type="text" placeholder="MM/YY" />
        </div>

        <div v-if="mostrarCamposTarjetaFlag" class="form-group">
          <label>CVV:</label>
          <input v-model="transaccionFormulario.cvv" type="text" placeholder="123" />
        </div>

        <div class="button-group">
          <button class="btn btn-success" @click="guardarTransaccion">Guardar</button>
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
      transacciones: [],
      horarios: [],
      clientes: [],
      autobuses: [],
      rutas: [],
      asientos: [],
      mostrarModal: false,
      esEdicion: false,
      transaccionFormulario: {
        metodo_pago: "Efectivo",
        numero_tarjeta: "",
        nombre_titular: "",
        fecha_expiracion: "",
        cvv: "",
      },
      mensajeError: "",
      busquedaId: "",
      itemsPorPagina: "5",
      mostrarCamposTarjetaFlag: false,
    };
  },
  computed: {
    transaccionesFiltradas() {
      let transacciones = [...this.transacciones];
      
      // Ordenar por ID de forma descendente (opcional)
      transacciones.sort((a, b) => b.id_transaccion - a.id_transaccion);
      
      if (this.itemsPorPagina === "todos") {
        return transacciones;
      } else {
        return transacciones.slice(0, parseInt(this.itemsPorPagina, 10));
      }
    },
  },
  methods: {
    async cargarDatos() {
      try {
        const [transacciones, horarios, clientes, autobuses, rutas, asientos] = await Promise.all([
          axios.get("http://localhost:3001/transacciones"),
          axios.get("http://localhost:3001/horarios"),
          axios.get("http://localhost:3001/clientes"),
          axios.get("http://localhost:3001/api/autobuses"),
          axios.get("http://localhost:3001/rutas"),
          axios.get("http://localhost:3001/asientos"),
        ]);

        this.transacciones = transacciones.data;
        this.horarios = horarios.data;
        this.clientes = clientes.data;
        this.autobuses = autobuses.data;
        this.rutas = rutas.data;
        this.asientos = asientos.data;
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    },
    abrirModal(esEdicion, transaccion = null) {
      this.mostrarModal = true;
      this.esEdicion = esEdicion;
      this.transaccionFormulario = transaccion
        ? { ...transaccion }
        : {
            metodo_pago: "Efectivo",
            numero_tarjeta: "",
            nombre_titular: "",
            fecha_expiracion: "",
            cvv: "",
          };
      this.mostrarCamposTarjetaFlag = this.transaccionFormulario.metodo_pago === "Tarjeta";
    },
    cerrarModal() {
      this.mostrarModal = false;
      this.mensajeError = "";
    },
    async guardarTransaccion() {
      if (this.transaccionFormulario.metodo_pago === "Tarjeta") {
        if (
          !this.transaccionFormulario.numero_tarjeta ||
          !this.transaccionFormulario.nombre_titular ||
          !this.transaccionFormulario.fecha_expiracion ||
          !this.transaccionFormulario.cvv
        ) {
          this.mensajeError = "Por favor, complete todos los campos de la tarjeta.";
          return;
        }
      }

      try {
        let response;
        if (this.esEdicion) {
          response = await axios.put(
            `http://localhost:3001/transacciones/${this.transaccionFormulario.id_transaccion}`,
            this.transaccionFormulario
          );
          const index = this.transacciones.findIndex(
            (t) => t.id_transaccion === this.transaccionFormulario.id_transaccion
          );
          if (index !== -1) {
            this.transacciones.splice(index, 1, response.data);
          }
        } else {
          response = await axios.post(
            "http://localhost:3001/transacciones",
            this.transaccionFormulario
          );
          this.transacciones.unshift(response.data); // Agrega al inicio
        }

        alert("✅ Transacción guardada correctamente.");
        this.cerrarModal();
      } catch (error) {
        this.mensajeError = error.response?.data?.message || "❌ Error al guardar la transacción.";
      }
    },
    async buscarTransaccion() {
      if (!this.busquedaId) {
        alert("Por favor, ingrese un ID para buscar.");
        return;
      }
      try {
        const response = await axios.get(`http://localhost:3001/transacciones/${this.busquedaId}`);
        this.transacciones = [response.data];
      } catch (error) {
        alert("No se encontró ninguna transacción con el ID proporcionado.");
        console.error("Error al buscar transacción:", error);
      }
    },
    async eliminarTransaccion(id) {
      if (confirm("¿Está seguro de que desea eliminar esta transacción?")) {
        try {
          await axios.delete(`http://localhost:3001/transacciones/${id}`);
          this.transacciones = this.transacciones.filter((t) => t.id_transaccion !== id);
          alert("Transacción eliminada correctamente.");
        } catch (error) {
          alert("Error al eliminar la transacción.");
          console.error("Error al eliminar transacción:", error);
        }
      }
    },
    mostrarCamposTarjeta() {
      this.mostrarCamposTarjetaFlag = this.transaccionFormulario.metodo_pago === "Tarjeta";
    },
    imprimirTransaccion(transaccion) {
      const contenido = `
        <h4>Detalle de la Transacción</h4>
        <h4>Gracias por viajar con nosotros</h4>
        <h4>Somos RutaExpress</h4>
        <p><strong>ID:</strong> ${transaccion.id_transaccion}</p>
        <p><strong>Horario:</strong> ${transaccion.Horario?.fecha_salida || "No asignado"}</p>
        <p><strong>Cliente:</strong> ${transaccion.Cliente?.nombre_completo || "Sin cliente"}</p>
        <p><strong>Bus:</strong> ${transaccion.Bus?.placa || "No asignado"}</p>
        <p><strong>Ruta:</strong> ${transaccion.Ruta?.origen || "No asignado"}</p>
        <p><strong>Asiento:</strong> ${transaccion.Asiento?.numero_asiento || "No asignado"}</p>
        <p><strong>Precio:</strong> ${transaccion.precio}</p>
        <p><strong>Estado:</strong> ${transaccion.estado}</p>
        <p><strong>Fecha Compra:</strong> ${transaccion.fecha_compra}</p>
        <p><strong>Método Pago:</strong> ${transaccion.metodo_pago}</p>
        <p><strong>Código Ticket:</strong> ${transaccion.codigo_ticket}</p>
        <h4>Feliz viaje te desea RutaExpress</h3>
        <h4>Tel: 95634359, Email: rutaexpress2025@gmail.com</h4>
      `;

      const ventanaImpresion = window.open("", "", "width=600,height=600");
      ventanaImpresion.document.write(contenido);
      ventanaImpresion.document.close();
      ventanaImpresion.print();
    },
  },
  mounted() {
    this.cargarDatos();
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
}
.options-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.table-responsive {
  margin-top: 20px;
}
.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn-success {
  background-color: #28a745;
  color: white;
}
.btn-warning {
  background-color: #ffc107;
  color: black;
}
.btn-danger {
  background-color: #dc3545;
  color: white;
}
.btn-info {
  background-color: #17a2b8;
  color: white;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-content-small {
  max-width: 400px;
}
.error-message {
  color: red;
  margin-bottom: 10px;
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
  border: 1px solid #ccc;
  border-radius: 4px;
}
.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>