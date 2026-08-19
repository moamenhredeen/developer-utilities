import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/timestamp',
      name: 'timestamp',
      component: () => import('../views/TimestampView.vue'),
    },
    {
      path: '/color',
      name: 'color',
      component: () => import('../views/ColorView.vue'),
    },
    {
      path: '/password',
      name: 'password',
      component: () => import('../views/PasswordView.vue'),
    },
    {
      path: '/hash',
      name: 'hash',
      component: () => import('../views/HashView.vue'),
    },
    {
      path: '/crypto',
      name: 'crypto',
      component: () => import('../views/CryptoView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
