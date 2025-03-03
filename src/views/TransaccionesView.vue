<template>
  <div class="transaccion-component">
    <!-- Vista de listado -->
    <div v-if="currentView === 'list'">
      <div class="header">
        <h2>Listado de Transacciones</h2>
        <button class="btn btn-add" @click="goToCreate">Agregar Transacción</button>
      </div>

      <!-- Buscador por ID de Transacción -->
      <div class="search-box">
        <label for="search">Buscar por ID de Transacción:</label>
        <input type="text" id="search" v-model="searchQuery" placeholder="Ingrese ID de Transacción" />
      </div>

      <!-- Control de registros a mostrar -->
      <div class="records-control">
        <label for="recordsSelect">Mostrar registros:</label>
        <select id="recordsSelect" v-model="recordsToShow">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      <table class="transaccion-table">
        <thead>
          <tr>
            <th>ID Transacción</th>
            <th>ID Horario</th>
            <th>ID Cliente</th>
            <th>Asiento</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Fecha de Compra</th>
            <th>Método de Pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(transaccion, index) in displayedTransacciones" :key="transaccion.idTransaccion">
            <td>{{ transaccion.idTransaccion }}</td>
            <td>{{ transaccion.idHorario }}</td>
            <td>{{ transaccion.idCliente }}</td>
            <td>{{ transaccion.asiento }}</td>
            <td>{{ transaccion.precio }}</td>
            <td>{{ transaccion.estado }}</td>
            <td>{{ transaccion.fechaCompra }}</td>
            <td>{{ transaccion.metodoPago }}</td>
            <td class="actions">
              <button class="btn btn-edit" @click="goToEdit(index)">Editar</button>
              <button class="btn btn-delete" @click="confirmDelete(index)">Eliminar</button>
              <button class="btn btn-print" @click="imprimirTransaccion(transaccion)">Imprimir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Formulario de creación/edición -->
    <div v-else-if="currentView === 'create'" class="form-view">
      <h2>{{ editIndex !== null ? "Editar Transacción" : "Agregar Transacción" }}</h2>
      <form @submit.prevent="saveTransaccion" class="transaccion-form">
        <div class="form-group">
          <label for="idTransaccion">ID Transacción:</label>
          <input type="text" id="idTransaccion" v-model="currentTransaccion.idTransaccion" class="small-input" disabled />
        </div>
        <div class="form-group">
          <label for="idHorario">ID Horario:</label>
          <input type="text" id="idHorario" v-model="currentTransaccion.idHorario" placeholder="Ingrese ID Horario" class="small-input" @input="validateNumber('idHorario')" />
        </div>
        <div class="form-group">
          <label for="idCliente">ID Cliente:</label>
          <input type="text" id="idCliente" v-model="currentTransaccion.idCliente" placeholder="Ingrese ID Cliente" class="small-input" @input="validateNumber('idCliente')" />
        </div>
        <div class="form-group">
          <label for="asiento">Asiento:</label>
          <input type="text" id="asiento" v-model="currentTransaccion.asiento" placeholder="Ingrese Asiento" class="small-input" @input="validateNumber('asiento')" />
        </div>
        <div class="form-group">
          <label for="precio">Precio:</label>
          <input type="text" id="precio" v-model="currentTransaccion.precio" placeholder="Ingrese Precio" class="small-input" @input="validateNumber('precio')" />
        </div>
        <div class="form-group">
          <label for="estado">Estado:</label>
          <select id="estado" v-model="currentTransaccion.estado" class="small-input">
            <option value="pagado">Pagado</option>
            <option value="reservado">Reservado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div class="form-group">
          <label for="fechaCompra">Fecha de Compra:</label>
          <input type="date" id="fechaCompra" v-model="currentTransaccion.fechaCompra" class="small-input" />
        </div>
        <div class="form-group">
          <label for="metodoPago">Método de Pago:</label>
          <select id="metodoPago" v-model="currentTransaccion.metodoPago" class="small-input" @change="toggleTarjetaFields">
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>
        <div v-if="currentTransaccion.metodoPago === 'tarjeta'" class="form-group">
          <label for="numeroTarjeta">Número de Tarjeta:</label>
          <input type="text" id="numeroTarjeta" v-model="currentTransaccion.numeroTarjeta" placeholder="Ingrese Número de Tarjeta" class="small-input" @input="validateTarjeta" maxlength="16" />
        </div>
        <div v-if="currentTransaccion.metodoPago === 'tarjeta'" class="form-group">
          <label for="fechaExpiracion">Fecha de Expiración:</label>
          <input type="text" id="fechaExpiracion" v-model="currentTransaccion.fechaExpiracion" placeholder="MM/YY" class="small-input" @input="validateFechaExpiracion" maxlength="4" />
        </div>
        <div v-if="currentTransaccion.metodoPago === 'tarjeta'" class="form-group">
          <label for="cvv">CVV:</label>
          <input type="text" id="cvv" v-model="currentTransaccion.cvv" placeholder="Ingrese CVV" class="small-input" @input="validateCVV" maxlength="3" />
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

    <!-- Modal de Confirmación para Eliminar -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <p>¿Estás seguro que deseas eliminar esta transacción?</p>
        <div class="modal-actions">
          <button @click="deleteTransaccion" class="btn btn-confirm">Sí</button>
          <button @click="showDeleteModal = false" class="btn btn-cancel">No</button>
        </div>
      </div>
    </div>

    <!-- Modal de Éxito en la parte superior derecha -->
    <div v-if="showSuccessModal" class="modal-success">
      <p>{{ successMessage }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "TransaccionComponent",
  data() {
    return {
      currentView: "list",
      transacciones: JSON.parse(localStorage.getItem("transacciones")) || [],
      recordsToShow: "5",
      searchQuery: "",
      showErrorModal: false,
      errorMessage: "",
      showSuccessModal: false,
      successMessage: "",
      showDeleteModal: false,
      deleteIndex: null,
      currentTransaccion: {
        idTransaccion: 1,
        idHorario: "",
        idCliente: "",
        asiento: "",
        precio: "",
        estado: "pagado",
        fechaCompra: "",
        metodoPago: "efectivo",
        numeroTarjeta: "",
        fechaExpiracion: "",
        cvv: ""
      },
      editIndex: null
    };
  },
  computed: {
    filteredTransacciones() {
      if (!this.searchQuery.trim()) return this.transacciones;
      return this.transacciones.filter(transaccion =>
        transaccion.idTransaccion.toString().includes(this.searchQuery)
      );
    },
    displayedTransacciones() {
      if (this.recordsToShow === "todos") {
        return this.filteredTransacciones;
      } else {
        return this.filteredTransacciones.slice(0, Number(this.recordsToShow));
      }
    }
  },
  methods: {
    generateTransaccionId() {
      return this.transacciones.length > 0 ? Math.max(...this.transacciones.map(t => t.idTransaccion)) + 1 : 1;
    },
    validateNumber(field) {
      this.currentTransaccion[field] = this.currentTransaccion[field].replace(/\D/g, '');
    },
    validateTarjeta() {
      this.currentTransaccion.numeroTarjeta = this.currentTransaccion.numeroTarjeta.replace(/\D/g, '');
    },
    validateFechaExpiracion() {
      this.currentTransaccion.fechaExpiracion = this.currentTransaccion.fechaExpiracion.replace(/\D/g, '');
    },
    validateCVV() {
      this.currentTransaccion.cvv = this.currentTransaccion.cvv.replace(/\D/g, '');
    },
    saveTransaccion() {
      if (!this.currentTransaccion.idHorario || !this.currentTransaccion.idCliente || !this.currentTransaccion.asiento || !this.currentTransaccion.precio || !this.currentTransaccion.estado || !this.currentTransaccion.fechaCompra || !this.currentTransaccion.metodoPago) {
        this.errorMessage = "Todos los campos son obligatorios.";
        this.showErrorModal = true;
        return;
      }

      if (this.currentTransaccion.metodoPago === 'tarjeta' && (!this.currentTransaccion.numeroTarjeta || !this.currentTransaccion.fechaExpiracion || !this.currentTransaccion.cvv)) {
        this.errorMessage = "Todos los campos de la tarjeta son obligatorios.";
        this.showErrorModal = true;
        return;
      }

      if (this.editIndex !== null) {
        this.transacciones.splice(this.editIndex, 1, { ...this.currentTransaccion });
        this.successMessage = "Transacción actualizada correctamente.";
      } else {
        this.currentTransaccion.idTransaccion = this.generateTransaccionId();
        this.transacciones.push({ ...this.currentTransaccion });
        this.successMessage = "Transacción agregada correctamente.";
      }

      localStorage.setItem("transacciones", JSON.stringify(this.transacciones));

      this.showSuccessModal = true;
      setTimeout(() => (this.showSuccessModal = false), 3000);
      this.resetCurrentTransaccion();
      this.currentView = "list";
    },
    confirmDelete(index) {
      this.deleteIndex = index;
      this.showDeleteModal = true;
    },
    deleteTransaccion() {
      if (this.deleteIndex !== null) {
        this.transacciones.splice(this.deleteIndex, 1);
        localStorage.setItem("transacciones", JSON.stringify(this.transacciones));
      }
      this.showDeleteModal = false;
    },
    goToCreate() {
      this.resetCurrentTransaccion();
      this.currentView = "create";
    },
    goToEdit(index) {
      this.editIndex = index;
      this.currentTransaccion = { ...this.transacciones[index] };
      this.currentView = "create";
    },
    goToList() {
      this.currentView = "list";
    },
    resetCurrentTransaccion() {
      this.currentTransaccion = {
        idTransaccion: this.generateTransaccionId(),
        idHorario: "",
        idCliente: "",
        asiento: "",
        precio: "",
        estado: "pagado",
        fechaCompra: "",
        metodoPago: "efectivo",
        numeroTarjeta: "",
        fechaExpiracion: "",
        cvv: ""
      };
      this.editIndex = null;
    },
    toggleTarjetaFields() {
      if (this.currentTransaccion.metodoPago !== 'tarjeta') {
        this.currentTransaccion.numeroTarjeta = "";
        this.currentTransaccion.fechaExpiracion = "";
        this.currentTransaccion.cvv = "";
      }
    },
    imprimirTransaccion(transaccion) {
      const contenido = `
        <h2>Detalle de Transacción</h2>
        <p><strong>ID Transacción:</strong> ${transaccion.idTransaccion}</p>
        <p><strong>ID Horario:</strong> ${transaccion.idHorario}</p>
        <p><strong>ID Cliente:</strong> ${transaccion.idCliente}</p>
        <p><strong>Asiento:</strong> ${transaccion.asiento}</p>
        <p><strong>Precio:</strong> ${transaccion.precio}</p>
        <p><strong>Estado:</strong> ${transaccion.estado}</p>
        <p><strong>Fecha de Compra:</strong> ${transaccion.fechaCompra}</p>
        <p><strong>Método de Pago:</strong> ${transaccion.metodoPago}</p>
      `;
      const ventanaImpresion = window.open("", "_blank");
      ventanaImpresion.document.write(contenido);
      ventanaImpresion.document.close();
      ventanaImpresion.print();
    }
  }
};
</script>
  <style scoped>
  .transaccion-component {
    max-width: 1200px;
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
  .transaccion-table {
    width: 100%;
    margin: 0 auto;
    border-collapse: collapse;
    table-layout: auto;
  }
  .transaccion-table th,
  .transaccion-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
    vertical-align: middle;
  }
  .transaccion-table th {
    background-color: #f2f2f2;
  }
  .transaccion-table tbody tr:hover {
    background-color: #e8f4fc;
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
  .transaccion-form {
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