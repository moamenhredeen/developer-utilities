<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

defineProps<{ title: string; description?: string }>()

const router = useRouter()

function onKey(e: KeyboardEvent) {
  // Esc returns home, unless a menu/native picker is open.
  if (e.key === 'Escape') router.push('/')
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div>
    <RouterLink to="/" class="text-sm text-muted hover:text-ink transition-colors">
      ← back <span class="text-faint">esc</span>
    </RouterLink>

    <h1 class="mt-6 text-2xl tracking-tight">{{ title }}</h1>
    <p v-if="description" class="mt-2 text-sm text-muted">{{ description }}</p>

    <hr class="mt-6 border-line" />

    <div class="mt-8">
      <slot />
    </div>

    <section v-if="$slots.about" class="mt-16 border-t border-line pt-8 text-sm leading-7 text-muted">
      <slot name="about" />
    </section>
  </div>
</template>
