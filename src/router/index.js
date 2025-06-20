import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  // Additional routes for future games can be added here
  {
    path: '/game1',
    name: 'game1',
    component: () => import('../views/Game1.vue')
  },
  {
    path: '/game2',
    name: 'game2',
    component: () => import('../views/Game2.vue')
  },
  {
    path: '/game3',
    name: 'game3',
    component: () => import('../views/Game3.vue')
  },
  {
    path: '/game3variant',
    name: 'game3variant',
    component: () => import('../views/Game3Variant.vue')
  },
  {
    path: '/game4',
    name: 'game4',
    component: () => import('../views/Game4.vue')
  },
  {
    path: '/game5',
    name: 'game5',
    component: () => import('../views/Game5.vue')
  },
  {
    path: '/game6',
    name: 'game6',
    component: () => import('../views/Game6.vue')
  },
  {
    path: '/game7',
    name: 'game7',
    component: () => import('../views/Game7.vue')
  },
  {
    path: '/game8',
    name: 'game8',
    component: () => import('../views/Game8.vue')
  },
  {
    path: '/game9',
    name: 'game9',
    component: () => import('../views/Game9.vue')
  },
  {
    path: '/game10',
    name: 'game10',
    component: () => import('../views/Game10.vue')
  },
  {
    path: '/game11',
    name: 'game11',
    component: () => import('../views/Game11.vue')
  },
  {
    path: '/game12',
    name: 'game12',
    component: () => import('../views/Game12.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
