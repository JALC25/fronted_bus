<template>
  <div class="container">
    <h1 class="titulo">Bienvenido a <span class="resaltado">RutaExpress</span></h1>
    <p class="descripcion">Visualiza las estadísticas de transacciones y clientes en tiempo real.</p>

    <!-- Contenedor de gráficos -->
    <div class="graficos-container">
      <div class="grafico">
        <h2>Estado de Transacciones</h2>
        <canvas ref="barCanvas"></canvas>
      </div>
      <div class="grafico">
        <h2>Crecimiento de Clientes</h2>
        <canvas ref="lineCanvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";
import axios from "axios";

export default {
  setup() {
    const barCanvas = ref(null);
    const lineCanvas = ref(null);

    const transaccionesData = {
      labels: ["Completadas", "Pendientes", "Canceladas"],
      datasets: [
        {
          label: "Estado de Transacciones",
          backgroundColor: ["#28a745", "#ffc107", "#dc3545"],
          data: [0, 0, 0], // Se actualizarán con la API
        },
      ],
    };

    const clientesData = {
      labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
      datasets: [
        {
          label: "Nuevos Clientes",
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.5)",
          data: [0, 0, 0, 0, 0], // Se actualizarán con la API
        },
      ],
    };

    const cargarDatos = async () => {
      try {
        const transaccionesRes = await axios.get("http://localhost:3001/transacciones");
        const clientesRes = await axios.get("http://localhost:3001/clientes");

        // Conteo de transacciones por estado
        const completadas = transaccionesRes.data.filter((t) => t.estado === "Comprado").length;
        const pendientes = transaccionesRes.data.filter((t) => t.estado === "Reservado").length;
        const canceladas = transaccionesRes.data.filter((t) => t.estado === "Cancelado").length;

        transaccionesData.datasets[0].data = [completadas, pendientes, canceladas];

        // Simulación de clientes por mes
        clientesData.datasets[0].data = [
          clientesRes.data.length,
          clientesRes.data.length + 5,
          clientesRes.data.length + 10,
          clientesRes.data.length + 15,
          clientesRes.data.length + 20,
        ];

        // Dibujar gráficos después de obtener datos
        new Chart(barCanvas.value, {
          type: "bar",
          data: transaccionesData,
          options: { responsive: true, maintainAspectRatio: false },
        });

        new Chart(lineCanvas.value, {
          type: "line",
          data: clientesData,
          options: { responsive: true, maintainAspectRatio: false },
        });

      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    onMounted(() => {
      cargarDatos();
    });

    return { barCanvas, lineCanvas };
  },
};
</script>

<style>
.container {
  text-align: center;
  padding: 20px;
}
.titulo {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}
.resaltado {
  color: #007bff;
}
.descripcion {
  font-size: 18px;
  color: #555;
  margin-bottom: 20px;
}

/* Ajustar tamaño de gráficos */
.graficos-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  margin-top: 10px;
}
.grafico {
  width: 40%;
  height: 250px; /* Ajuste del tamaño del gráfico */
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
}
canvas {
  max-width: 100%;
  max-height: 180px; /* Reducción del tamaño */
}
</style>
