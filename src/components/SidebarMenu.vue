<template>
    <div class="sidebar-container">
      <!-- Header del Sidebar -->
      <header class="sidebar-header">
        <h2><i class="fas fa-bus"></i> Sistema de Buses</h2>
      </header>
  
      <!-- Menú lateral -->
      <nav class="menu">
        <ul>
          <li v-for="item in menuItems" :key="item.path">
            <router-link :to="item.path" active-class="active">
              <i :class="item.icon"></i> {{ item.label }}
            </router-link>
          </li>
        </ul>
      </nav>
  
      <!-- Footer del Sidebar -->
      <footer class="sidebar-footer">
        <p>&copy; 2025 Sistema de Buses</p>
      </footer>
    </div>
  
    <!-- Contenido dinámico -->
    <div class="content">
      <router-view></router-view>
    </div>
  </template>
  
  <script setup>
  const menuItems = [
    { path: "/", label: "Inicio", icon: "fas fa-home" },
    { path: "/cliente", label: "Cliente", icon: "fas fa-user" },
    { path: "/usuario", label: "Usuario", icon: "fas fa-users" },
    { path: "/choferes", label: "Choferes", icon: "fas fa-id-badge" },
    { path: "/buses", label: "Buses", icon: "fas fa-bus" },
    { path: "/rutas", label: "Rutas", icon: "fas fa-map-marked-alt" },
    { path: "/horarios", label: "Horarios", icon: "fas fa-clock" },
    { path: "/transacciones", label: "Transacciones", icon: "fas fa-money-bill-wave" },
    { path: "/empresas", label: "Empresas", icon: "fas fa-building" },
    { path: "/asientos", label: "Asientos", icon: "fas fa-chair" }
  ];
  </script>
  
  <style scoped>
  /* Contenedor principal */
  .sidebar-container {
    width: 180px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #1e293b;
    color: white;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    position: fixed;
  }
  
  /* Header */
  .sidebar-header {
    text-align: center;
    padding: 15px;
    background: #1e293b;
    font-weight: bold;
    border-bottom: 2px solid #334155;
  }
  
  /* Menú */
  .menu {
    flex-grow: 1; /* Hace que el menú ocupe el espacio disponible */
    padding: 15px;
  }
  
  .menu ul {
    list-style: none;
    padding: 0;
  }
  
  .menu li {
    margin: 10px 0;
  }
  
  .menu a {
    display: flex;
    align-items: center;
    padding: 10px;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    transition: background 0.3s, transform 0.2s;
  }
  
  .menu a i {
    margin-right: 10px;
  }
  
  .menu a:hover {
    background: #334155;
    transform: translateX(5px);
  }
  
  .menu a.active {
    background: #475569;
    font-weight: bold;
  }
  
  /* Footer */
  .sidebar-footer {
    text-align: center;
    padding: 10px;
    background: #1e293b;
    font-size: 12px;
    border-top: 2px solid #334155;
  }
  
  /* Contenido principal */
  .content {
    margin-left: 200px; /* Ajusta el contenido a la derecha del sidebar */
    padding: 20px;
    background: #f1f5f9;
    width: calc(100% - 200px);
    height: 100vh;
    overflow-y: auto;
  }
  </style>
  