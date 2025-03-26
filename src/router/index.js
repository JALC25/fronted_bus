import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import InicioView from '../views/InicioView.vue';
import ClienteView from '../views/ClienteView.vue';
import UsuarioView from '../views/UsuarioView.vue';
import ChoferesView from '../views/ChoferesView.vue';
import BusesView from '../views/BusesView.vue';
import RutasView from '../views/RutasView.vue';
import HorariosView from '../views/HorariosView.vue';
import TransaccionesView from '../views/TransaccionesView.vue';
import EmpresasView from '../views/EmpresasView.vue';
import AsientosView from '../views/AsientosView.vue';

const routes = [
  { 
    path: '/', 
    redirect: '/login' 
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: LoginView,
    meta: { hideSidebar: true } // Nueva meta propiedad
  },
  { 
    path: '/inicio', 
    component: InicioView,
    meta: { requiresAuth: true } 
  },
  { 
    path: '/cliente', 
    component: ClienteView,
    meta: { requiresAuth: true } 
  },
  { 
    path: '/usuario', 
    component: UsuarioView,
    meta: { requiresAuth: true, role: 'administrador' } 
  },
  { 
    path: '/choferes', 
    component: ChoferesView,
    meta: { requiresAuth: true } 
  },
  { 
    path: '/buses', 
    component: BusesView,
    meta: { requiresAuth: true } 
  },
  { 
    path: '/rutas', 
    component: RutasView,
    meta: { requiresAuth: true } 
  },
  { 
    path: '/horarios', 
    component: HorariosView,
    meta: { requiresAuth: true } 
  },
  { 
    path: '/transacciones', 
    component: TransaccionesView,
    meta: { requiresAuth: true } 
  },
  { 
    path: '/empresas', 
    component: EmpresasView,
    meta: { requiresAuth: true, role: 'administrador' } 
  },
  { 
    path: '/asientos', 
    component: AsientosView,
    meta: { requiresAuth: true } 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (to.meta.requiresAuth && !user) {
    next('/login');
  } else if (to.meta.role && user?.role !== to.meta.role) {
    next('/inicio');
  } else {
    next();
  }
});

export default router;