import { createRouter, createWebHistory } from 'vue-router';
import PageLayout from '../components/common/PageLayout.vue';
import LoginPage from '../pages/auth/LoginPage.vue';
import RegisterPage from '../pages/auth/RegisterPage.vue';
import TaskLaunchPage from '../pages/home/TaskLaunchPage.vue';
import TaskProcessPage from '../pages/process/TaskProcessPage.vue';
import ReportPreviewPage from '../pages/report/ReportPreviewPage.vue';
import HistoryFavoritesPage from '../pages/profile/HistoryFavoritesPage.vue';

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  {
    path: '/',
    component: PageLayout,
    children: [
      { path: '', component: TaskLaunchPage },
      { path: 'process', component: TaskProcessPage },
      { path: 'report', component: ReportPreviewPage },
      { path: 'history', component: HistoryFavoritesPage },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
