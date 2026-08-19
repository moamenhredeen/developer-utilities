<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import UtilityLayout from '../components/UtilityLayout.vue'
import CopyButton from '../components/CopyButton.vue'

const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?/'
const AMBIGUOUS = new Set('Il1O0o'.split(''))

const opts = reactive({
  length: 20,
  lower: true,
  upper: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
})

const password = ref('')

const pool = computed(() => {
  let chars = ''
  if (opts.lower) chars += LOWER
  if (opts.upper) chars += UPPER
  if (opts.digits) chars += DIGITS
  if (opts.symbols) chars += SYMBOLS
  if (opts.excludeAmbiguous) {
    chars = chars.split('').filter((c) => !AMBIGUOUS.has(c)).join('')
  }
  return chars
})

/** Unbiased index in [0, max) via rejection sampling on 32-bit values. */
function randomIndex(max: number): number {
  const limit = Math.floor(0xffffffff / max) * max
  const buf = new Uint32Array(1)
  let x = 0
  do {
    crypto.getRandomValues(buf)
    x = buf[0]!
  } while (x >= limit)
  return x % max
}

function generate() {
  const chars = pool.value
  if (!chars.length) {
    password.value = ''
    return
  }
  let out = ''
  for (let i = 0; i < opts.length; i++) out += chars[randomIndex(chars.length)]
  password.value = out
}

const entropyBits = computed(() =>
  pool.value.length ? Math.round(opts.length * Math.log2(pool.value.length)) : 0,
)

const strength = computed(() => {
  const b = entropyBits.value
  if (b < 40) return { label: 'weak', pct: 25 }
  if (b < 60) return { label: 'fair', pct: 50 }
  if (b < 100) return { label: 'strong', pct: 75 }
  return { label: 'excellent', pct: 100 }
})

onMounted(generate)

const checkboxes: { key: keyof typeof opts; label: string }[] = [
  { key: 'lower', label: 'lowercase' },
  { key: 'upper', label: 'uppercase' },
  { key: 'digits', label: 'digits' },
  { key: 'symbols', label: 'symbols' },
  { key: 'excludeAmbiguous', label: 'exclude ambiguous · Il1O0o' },
]
</script>

<template>
  <UtilityLayout title="password" description="cryptographically strong, generated locally.">
    <!-- the password is the hero -->
    <div class="flex items-start justify-between gap-4">
      <p class="text-2xl break-all leading-relaxed">{{ password || '—' }}</p>
      <div class="flex shrink-0 items-center gap-4 pt-1">
        <CopyButton :value="password" />
        <button type="button" @click="generate" class="text-xs text-faint hover:text-ink transition-colors">↻ new</button>
      </div>
    </div>

    <!-- strength meter: one hairline -->
    <div class="mt-6">
      <div class="h-px w-full bg-line">
        <div class="h-px bg-accent transition-all duration-300" :style="{ width: strength.pct + '%' }" />
      </div>
      <div class="mt-2 flex justify-between text-xs text-muted">
        <span>{{ pool.length ? strength.label : 'no character set' }}</span>
        <span class="tabular-nums">~{{ entropyBits }} bits</span>
      </div>
    </div>

    <hr class="my-10 border-line" />

    <label class="block">
      <div class="flex justify-between text-sm">
        <span class="text-muted">length</span>
        <span class="tabular-nums">{{ opts.length }}</span>
      </div>
      <input v-model.number="opts.length" type="range" min="4" max="128" @input="generate" class="mt-3 w-full accent-accent" />
    </label>

    <div class="mt-8 space-y-3 text-sm">
      <label v-for="c in checkboxes" :key="c.key" class="flex items-center gap-3 cursor-pointer w-fit">
        <input type="checkbox" v-model="opts[c.key]" @change="generate" class="accent-accent" />
        <span class="text-muted">{{ c.label }}</span>
      </label>
    </div>

    <template #about>
      <h2 class="text-base text-ink">Secure password generator</h2>
      <p class="mt-3">
        Generate passwords from lowercase letters, uppercase letters, digits, and symbols. Adjust
        the length, remove ambiguous characters, and use the entropy estimate to compare settings.
      </p>
      <p class="mt-3">
        Passwords are produced with the browser's cryptographically secure random-number generator.
        Generation happens entirely on your device, and no generated password is transmitted or stored.
      </p>
    </template>
  </UtilityLayout>
</template>
