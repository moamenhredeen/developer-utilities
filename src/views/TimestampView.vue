<script setup lang="ts">
import { computed, ref } from 'vue'
import UtilityLayout from '../components/UtilityLayout.vue'
import CopyButton from '../components/CopyButton.vue'

type Precision = 's' | 'ms' | 'ns'
const precision = ref<Precision>('s')
const precisions: { id: Precision; label: string }[] = [
  { id: 's', label: 'seconds' },
  { id: 'ms', label: 'millis' },
  { id: 'ns', label: 'nanos' },
]

// --- timestamp -> date ---
const tsInput = ref('0')

const epochMs = computed<number | null>(() => {
  const raw = tsInput.value.trim()
  if (!/^-?\d+$/.test(raw)) return null
  try {
    if (precision.value === 'ns') return Number(BigInt(raw) / 1_000_000n)
    const n = Number(raw)
    return precision.value === 's' ? n * 1000 : n
  } catch {
    return null
  }
})

const parsedDate = computed(() => {
  if (epochMs.value === null) return null
  const d = new Date(epochMs.value)
  return isNaN(d.getTime()) ? null : d
})

const outLocal = computed(() => parsedDate.value?.toString() ?? '—')
const outUtc = computed(() => parsedDate.value?.toUTCString() ?? '—')
const outIso = computed(() => {
  try {
    return parsedDate.value?.toISOString() ?? '—'
  } catch {
    return '—'
  }
})

function setNow() {
  const nowMs = Date.now()
  if (precision.value === 's') tsInput.value = String(Math.floor(nowMs / 1000))
  else if (precision.value === 'ms') tsInput.value = String(nowMs)
  else tsInput.value = String(BigInt(nowMs) * 1_000_000n)
}

// --- date -> timestamp ---
const dateInput = ref('')

const fromDate = computed<string>(() => {
  if (!dateInput.value) return '—'
  const ms = new Date(dateInput.value).getTime()
  if (isNaN(ms)) return '—'
  if (precision.value === 's') return String(Math.floor(ms / 1000))
  if (precision.value === 'ms') return String(ms)
  return String(BigInt(ms) * 1_000_000n)
})

const field =
  'w-full bg-transparent border-0 border-b border-line focus:border-accent outline-none rounded-none py-2 placeholder:text-faint'
</script>

<template>
  <UtilityLayout title="timestamp" description="convert between unix timestamps and dates.">
    <div class="space-y-12">
      <div class="flex items-center gap-5 text-sm">
        <span class="eyebrow text-xs uppercase tracking-widest text-faint">precision</span>
        <button
          v-for="p in precisions"
          :key="p.id"
          type="button"
          @click="precision = p.id"
          class="transition-colors"
          :class="precision === p.id ? 'text-ink underline underline-offset-4' : 'text-muted hover:text-ink'"
        >
          {{ p.label }}
        </button>
      </div>

      <!-- timestamp -> date -->
      <section>
        <div class="flex items-baseline justify-between">
          <label class="text-xs uppercase tracking-widest text-muted">timestamp → date</label>
          <button type="button" @click="setNow" class="text-xs text-faint hover:text-ink transition-colors">now</button>
        </div>
        <input v-model="tsInput" :class="[field, 'mt-3 text-lg']" placeholder="enter a timestamp" inputmode="numeric" />
        <p v-if="tsInput.trim() && epochMs === null" class="mt-2 text-xs text-accent">not a valid integer timestamp</p>

        <dl class="mt-6 space-y-4 text-sm">
          <div v-for="row in [{ k: 'local', v: outLocal }, { k: 'utc', v: outUtc }, { k: 'iso 8601', v: outIso }]" :key="row.k" class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <dt class="text-xs text-faint">{{ row.k }}</dt>
              <dd class="break-all">{{ row.v }}</dd>
            </div>
            <CopyButton :value="row.v" />
          </div>
        </dl>
      </section>

      <!-- date -> timestamp -->
      <section>
        <label class="text-xs uppercase tracking-widest text-muted">date → timestamp</label>
        <input v-model="dateInput" type="datetime-local" step="1" :class="[field, 'mt-3']" />
        <div class="mt-6 flex items-start justify-between gap-4 text-sm">
          <div class="min-w-0">
            <dt class="text-xs text-faint">{{ precision }}</dt>
            <dd class="break-all text-lg">{{ fromDate }}</dd>
          </div>
          <CopyButton :value="fromDate" />
        </div>
      </section>
    </div>
  </UtilityLayout>
</template>
