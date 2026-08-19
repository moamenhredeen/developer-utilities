import {
  createRouter,
  createWebHistory,
  type RouterHistory,
  type RouteRecordRaw,
} from 'vue-router'
import HomeView from '../views/HomeView.vue'

export interface RouteSeo {
  title: string
  description: string
}

export const defaultSeo: RouteSeo = {
  title: 'Developer Utilities — Private, Browser-Based Tools',
  description:
    'Private, browser-based developer tools for timestamps, colors, passwords, hashes, and encryption. Your data never leaves your device.',
}

export const routes: RouteRecordRaw[] = [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/timestamp',
      name: 'timestamp',
      component: () => import('../views/TimestampView.vue'),
      meta: {
        seo: {
          title: 'Unix Timestamp Converter — Developer Utilities',
          description:
            'Convert Unix timestamps in seconds, milliseconds, or nanoseconds to local, UTC, and ISO 8601 dates in your browser.',
        } satisfies RouteSeo,
      },
    },
    {
      path: '/color',
      name: 'color',
      component: () => import('../views/ColorView.vue'),
      meta: {
        seo: {
          title: 'Color Converter: HEX, RGB, HSL & HSV — Developer Utilities',
          description:
            'Convert colors instantly between HEX, RGB, HSL, and HSV formats with a private, browser-based color tool.',
        } satisfies RouteSeo,
      },
    },
    {
      path: '/password',
      name: 'password',
      component: () => import('../views/PasswordView.vue'),
      meta: {
        seo: {
          title: 'Secure Password Generator — Developer Utilities',
          description:
            'Generate configurable, cryptographically strong passwords locally in your browser. Passwords never leave your device.',
        } satisfies RouteSeo,
      },
    },
    {
      path: '/hash',
      name: 'hash',
      component: () => import('../views/HashView.vue'),
      meta: {
        seo: {
          title: 'SHA Hash Generator — Developer Utilities',
          description:
            'Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from UTF-8 text locally in your browser.',
        } satisfies RouteSeo,
      },
    },
    {
      path: '/crypto',
      name: 'crypto',
      component: () => import('../views/CryptoView.vue'),
      meta: {
        seo: {
          title: 'Browser Encryption Tool — Developer Utilities',
          description:
            'Encrypt and decrypt text locally with AES-GCM, AES-CBC, or ChaCha20-Poly1305. Your data never leaves your browser.',
        } satisfies RouteSeo,
      },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
]

export function createAppRouter(history: RouterHistory = createWebHistory(import.meta.env.BASE_URL)) {
  return createRouter({ history, routes })
}
