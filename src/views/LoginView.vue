<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2><i class="fas fa-bus"></i> Sistema de Buses</h2>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Usuario</label>
          <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Ingrese su usuario"
            required
          />
          <i class="fas fa-user"></i>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Ingrese su contraseña"
            required
          />
          <i class="fas fa-lock"></i>
        </div>

        <div class="button-group">
          <button type="button" class="cancel-button" @click="handleCancel">
            Cancelar
          </button>
          <button type="submit" class="login-button" :disabled="loading">
            <span v-if="!loading">Ingresar</span>
            <span v-else>
              <i class="fas fa-spinner fa-spin"></i> Procesando...
            </span>
          </button>
        </div>

        <div v-if="errorMessage" class="error-message">
          <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const router = useRouter();

// Credenciales de prueba (en producción esto debe venir de tu backend)
const validUsers = {
  admin: {
    password: 'admin123',
    role: 'administrador',
    name: 'Administrador del Sistema'
  },
  usuario: {
    password: 'user123',
    role: 'usuario',
    name: 'Usuario Regular'
  }
};

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    // Simulamos un retraso de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = validUsers[username.value.toLowerCase()];
    
    if (user && user.password === password.value) {
      // Guardamos los datos del usuario en localStorage
      const userData = {
        username: username.value,
        name: user.name,
        role: user.role,
        token: `token-${Math.random().toString(36).substr(2, 9)}`
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirigimos al inicio
      router.push('/inicio');
    } else {
      throw new Error('Usuario y/o Contraseña');
    }
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  username.value = '';
  password.value = '';
  errorMessage.value = '';
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e293b, #334155);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: 25px 20px;
  background: #1e293b;
  color: white;
}

.login-header h2 {
  margin: 0;
  font-size: 24px;
}

.login-form {
  padding: 25px;
}

.form-group {
  position: relative;
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #334155;
}

.form-group input {
  width: 100%;
  padding: 12px 15px 12px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #1e293b;
  outline: none;
}

.form-group i {
  position: absolute;
  left: 15px;
  top: 40px;
  color: #94a3b8;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.login-button, .cancel-button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.login-button {
  background: #1e293b;
  color: white;
}

.login-button:hover {
  background: #334155;
}

.login-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.cancel-button {
  background: #e2e8f0;
  color: #334155;
}

.cancel-button:hover {
  background: #cbd5e1;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
