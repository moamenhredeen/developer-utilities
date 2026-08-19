<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

const tools = [
  { key: 't', to: '/timestamp', name: 'timestamp', desc: 'unix ⇄ date · second / milli / nano' },
  { key: 'c', to: '/color', name: 'color', desc: 'hex · rgb · hsl · hsv' },
  { key: 'p', to: '/password', name: 'password', desc: 'cryptographically strong, configurable' },
  { key: 'h', to: '/hash', name: 'hash', desc: 'sha-1 / 256 / 384 / 512' },
  { key: 'e', to: '/crypto', name: 'encrypt', desc: 'aes-gcm · aes-cbc · chacha20-poly1305' },
]

function onKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const match = tools.find((t) => t.key === e.key.toLowerCase())
  if (match) {
    e.preventDefault()
    router.push(match.to)
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div>
    <h1 class="text-2xl tracking-tight">developer utilities</h1>
    <p class="mt-2 text-sm text-muted">
      a quiet toolbox. everything runs locally in your browser.
    </p>

    <ul class="mt-12 -mx-3">
      <li v-for="t in tools" :key="t.key">
        <RouterLink
          :to="t.to"
          class="group flex items-baseline gap-4 rounded-none px-3 py-3.5 border-b border-line hover:bg-ink/[0.03] dark:hover:bg-ink/[0.06] transition-colors"
        >
          <kbd
            class="w-5 shrink-0 text-center text-sm text-faint group-hover:text-accent transition-colors"
          >
            {{ t.key }}
          </kbd>
          <span class="w-28 shrink-0 group-hover:text-accent transition-colors">{{ t.name }}</span>
          <span class="text-sm text-muted truncate">{{ t.desc }}</span>
        </RouterLink>
      </li>
    </ul>

    <p class="mt-8 px-3 text-xs text-faint">
      press a key to jump — <span class="text-muted">t c p h e</span>
    </p>
  </div>
</template>
