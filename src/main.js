/* eslint-disable */

import { createApp } from 'vue'; // 👈 Asegúrate de importar correctamente desde 'vue'
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');

