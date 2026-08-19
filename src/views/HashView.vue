<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import UtilityLayout from '../components/UtilityLayout.vue'
import CopyButton from '../components/CopyButton.vue'

const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const
type Algo = (typeof ALGOS)[number]

const input = ref('')
const selected = reactive<Record<Algo, boolean>>({
  'SHA-1': false,
  'SHA-256': true,
  'SHA-384': false,
  'SHA-512': false,
})

const digests = ref<Record<string, string>>({})
const enc = new TextEncoder()

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function recompute() {
  const data = enc.encode(input.value)
  const next: Record<string, string> = {}
  for (const algo of ALGOS) {
    if (selected[algo]) next[algo] = toHex(await crypto.subtle.digest(algo, data))
  }
  digests.value = next
}

watch([input, () => ({ ...selected })], recompute, { immediate: true, deep: true })
</script>

<template>
  <UtilityLayout title="hash" description="sha digests of any text (utf-8), computed live.">
    <textarea
      v-model="input"
      rows="3"
      placeholder="type or paste text…"
      class="w-full bg-transparent border-0 border-b border-line focus:border-accent outline-none rounded-none py-2 resize-none placeholder:text-faint"
    />

    <div class="mt-5 flex flex-wrap gap-5 text-sm">
      <label v-for="algo in ALGOS" :key="algo" class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="selected[algo]" class="accent-accent" />
        <span :class="selected[algo] ? 'text-ink' : 'text-muted'">{{ algo.toLowerCase() }}</span>
      </label>
    </div>

    <div class="mt-10 space-y-6">
      <div v-for="algo in ALGOS" :key="algo" v-show="selected[algo]">
        <div class="flex items-baseline justify-between">
          <span class="text-xs uppercase tracking-widest text-muted">{{ algo }}</span>
          <CopyButton :value="digests[algo] ?? ''" />
        </div>
        <p class="mt-1 break-all text-sm">{{ digests[algo] ?? '' }}</p>
      </div>
    </div>

    <template #about>
      <h2 class="text-base text-ink">SHA hash generator</h2>
      <p class="mt-3">
        Calculate SHA-1, SHA-256, SHA-384, and SHA-512 digests from UTF-8 text. Select one or several
        algorithms to compare their hexadecimal output as you type.
      </p>
      <p class="mt-3">
        Hashing is one-way and is not encryption. SHA-1 is retained for compatibility checks but
        should not be used for modern security-sensitive applications. Input stays in your browser.
      </p>
    </template>
  </UtilityLayout>
</template>
