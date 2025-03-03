import { createRouter, createWebHistory } from 'vue-router';
import InicioView from '../views/InicioView.vue';
import ClienteView from '../views/ClienteView.vue';
import UsuarioView from '../views/UsuarioView.vue';
import ChoferesView from '../views/ChoferesView.vue';
import BusesView from '../views/BusesView.vue';
import RutasView from '../views/RutasView.vue';
import HorariosView from '../views/HorariosView.vue';
import TransaccionesView from '../views/TransaccionesView.vue';
import EmpresasView from '../views/EmpresasView.vue';  // Nueva vista

const routes = [
  { path: '/', component: InicioView },
  { path: '/cliente', component: ClienteView },
  { path: '/usuario', component: UsuarioView },
  { path: '/choferes', component: ChoferesView },
  { path: '/buses', component: BusesView },
  { path: '/rutas', component: RutasView },
  { path: '/horarios', component: HorariosView },
  { path: '/transacciones', component: TransaccionesView },
  { path: '/empresas', component: EmpresasView }  // Nueva ruta
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
