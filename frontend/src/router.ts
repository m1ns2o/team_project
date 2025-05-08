import { createRouter, createWebHistory } from 'vue-router';
import SelectPage from './pages/SelectPage.vue';
import ResultPage from './pages/ResultPage.vue';

const routes = [
  { path: '/', redirect: '/select' },
  { path: '/select', component: SelectPage },
  { path: '/result', component: ResultPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
