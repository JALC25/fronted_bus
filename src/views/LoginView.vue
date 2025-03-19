<template>
    <div class="login-container">
      <div class="login-box">
        <h2>Iniciar Sesión</h2>
  
        <form @submit.prevent="login">
          <div class="input-group">
            <label>Usuario</label>
            <input v-model="username" type="text" required placeholder="Ingrese su usuario" />
          </div>
  
          <div class="input-group">
            <label>Contraseña</label>
            <input v-model="password" type="password" required placeholder="Ingrese su contraseña" />
          </div>
  
          <div class="input-group">
            <label>Rol</label>
            <select v-model="role">
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
            </select>
          </div>
  
          <button type="submit">Ingresar</button>
        </form>
  
        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: '',
        password: '',
        role: 'user',
        error: null
      };
    },
    methods: {
      login() {
        const users = [
          { username: 'admin', password: 'admin123', role: 'admin' },
          { username: 'usuario', password: 'user123', role: 'user' }
        ];
  
        const user = users.find(u => u.username === this.username && u.password === this.password && u.role === this.role);
  
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.$router.push('/inicio');
        } else {
          this.error = 'Credenciales incorrectas';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* Contenedor principal */
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(to right, #4b6cb7, #182848);
  }
  
  /* Caja del login */
  .login-box {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    width: 350px;
    text-align: center;
  }
  
  /* Estilos del título */
  .login-box h2 {
    margin-bottom: 1rem;
    color: #333;
  }
  
  /* Grupo de entrada */
  .input-group {
    margin-bottom: 1rem;
    text-align: left;
  }
  
  .input-group label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    color: #333;
  }
  
  .input-group input,
  .input-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
  }
  
  /* Botón de login */
  button {
    width: 100%;
    background: #4b6cb7;
    color: white;
    padding: 10px;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background: #182848;
  }
  
  /* Mensaje de error */
  .error-message {
    color: red;
    margin-top: 1rem;
  }
  </style>
  