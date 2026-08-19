import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { createMemoryHistory } from 'vue-router'
import App from './App.vue'
import { createAppRouter, defaultSeo, type RouteSeo } from './router'

export async function render(url: string) {
  const app = createSSRApp(App)
  const router = createAppRouter(createMemoryHistory(import.meta.env.BASE_URL))

  app.use(router)
  await router.push(url)
  await router.isReady()

  const matched = router.currentRoute.value.matched.at(-1)
  const seo = (matched?.meta.seo as RouteSeo | undefined) ?? defaultSeo

  return {
    html: await renderToString(app),
    seo,
  }
}
