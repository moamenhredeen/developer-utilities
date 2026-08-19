import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render } from '../dist-ssr/entry-server.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const template = await readFile(resolve(root, 'dist/index.html'), 'utf8')
const routes = ['/', '/timestamp', '/color', '/password', '/hash', '/crypto']
const origin = 'https://tools.moamenhredeen.me'

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function createSeoHead(path, seo) {
  const url = `${origin}${path}`
  const title = escapeHtml(seo.title)
  const description = escapeHtml(seo.description)
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: seo.title.split(' — ')[0],
    url,
    description: seo.description,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    author: { '@type': 'Person', name: 'Moamen Hredeen' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }).replaceAll('<', '\\u003c')

  return `<!-- seo:start -->
    <meta name="description" content="${description}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Developer Utilities">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:locale" content="en_US">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <title>${title}</title>
    <script type="application/ld+json">${structuredData}</script>
    <!-- seo:end -->`
}

for (const path of routes) {
  const { html: appHtml, seo } = await render(path)
  const page = template
    .replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, createSeoHead(path, seo))
    .replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`)

  const output = path === '/' ? resolve(root, 'dist/index.html') : resolve(root, `dist${path}.html`)
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, page)
  console.log(`prerendered ${path}`)
}
