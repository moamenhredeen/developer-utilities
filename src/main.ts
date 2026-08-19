import { createSSRApp } from 'vue'
import App from './App.vue'
import { createAppRouter, defaultSeo, type RouteSeo } from './router'

const app = createSSRApp(App)
const router = createAppRouter()

app.use(router)

router.afterEach((to) => {
  const seo = (to.meta.seo as RouteSeo | undefined) ?? defaultSeo
  const url = new URL(to.path, window.location.origin).href

  document.title = seo.title
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', seo.description)
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', url)

  const metadata: Array<[string, string]> = [
    ['meta[property="og:title"]', seo.title],
    ['meta[property="og:description"]', seo.description],
    ['meta[property="og:url"]', url],
    ['meta[name="twitter:title"]', seo.title],
    ['meta[name="twitter:description"]', seo.description],
  ]

  for (const [selector, content] of metadata) {
    document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content)
  }
})

router.isReady().then(() => app.mount('#app'))
