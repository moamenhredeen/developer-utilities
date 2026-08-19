<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ value: string; label?: string }>()

const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  if (!props.value) return
  try {
    await navigator.clipboard.writeText(props.value)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), 1200)
  } catch {
    // Clipboard blocked (e.g. insecure context) — ignore silently.
  }
}
</script>

<template>
  <button
    type="button"
    @click="copy"
    class="shrink-0 text-xs transition-colors"
    :class="copied ? 'text-accent' : 'text-faint hover:text-ink'"
  >
    {{ copied ? 'copied' : (label ?? 'copy') }}
  </button>
</template>
