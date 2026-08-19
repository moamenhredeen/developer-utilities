<script setup lang="ts">
import './app.css'
import { RouterLink, RouterView } from 'vue-router'
import { useDarkMode } from './composables/useDarkMode'

const { isDark, toggle } = useDarkMode()
</script>

<template>
  <div class="min-h-screen bg-paper text-ink font-mono antialiased selection:text-ink">
    <div class="mx-auto max-w-2xl px-6">
      <header class="flex items-center justify-between py-6 text-sm">
        <RouterLink to="/" class="text-muted hover:text-ink transition-colors">
          developer/utilities
        </RouterLink>
        <button
          type="button"
          @click="toggle"
          :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
          class="text-muted hover:text-ink transition-colors"
        >
          {{ isDark ? 'light' : 'dark' }}
        </button>
      </header>

      <main class="pb-24">
        <RouterView />
      </main>
    </div>
  </div>
</template>
