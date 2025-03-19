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
import EmpresasView from '../views/EmpresasView.vue';  // Nueva vista
import AsientosView from '../views/AsientosView.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/inicio', component: InicioView },
  { path: '/cliente', component: ClienteView },
  { path: '/usuario', component: UsuarioView },
  { path: '/choferes', component: ChoferesView },
  { path: '/buses', component: BusesView },
  { path: '/rutas', component: RutasView },
  { path: '/horarios', component: HorariosView },
  { path: '/transacciones', component: TransaccionesView },
  { path: '/empresas', component: EmpresasView },  // Nueva ruta
  { path: '/asientos', component: AsientosView } // nueva ruta
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Proteger rutas según el rol

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
