<script setup lang="ts">
import { ref } from 'vue'
import UtilityLayout from '../components/UtilityLayout.vue'
import CopyButton from '../components/CopyButton.vue'
import { CIPHERS, decrypt, encrypt, type Cipher } from '../utils/crypto'

const mode = ref<'encrypt' | 'decrypt'>('encrypt')
const cipher = ref<Cipher>('aes-gcm')
const passphrase = ref('')
const input = ref('')
const output = ref('')
const error = ref('')
const busy = ref(false)

async function run() {
  error.value = ''
  output.value = ''
  busy.value = true
  try {
    output.value =
      mode.value === 'encrypt'
        ? await encrypt(cipher.value, passphrase.value, input.value)
        : await decrypt(cipher.value, passphrase.value, input.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}

function setMode(m: 'encrypt' | 'decrypt') {
  mode.value = m
  output.value = ''
  error.value = ''
}

const field =
  'w-full bg-transparent border-0 border-b border-line focus:border-accent outline-none rounded-none py-2 placeholder:text-faint'
</script>

<template>
  <UtilityLayout title="encrypt" description="passphrase encryption. runs entirely in your browser.">
    <div class="space-y-8">
      <div class="flex items-center gap-6 text-sm">
        <button
          v-for="m in (['encrypt', 'decrypt'] as const)"
          :key="m"
          type="button"
          @click="setMode(m)"
          class="transition-colors"
          :class="mode === m ? 'text-ink underline underline-offset-4' : 'text-muted hover:text-ink'"
        >
          {{ m }}
        </button>
      </div>

      <div>
        <label class="text-xs uppercase tracking-widest text-muted">cipher</label>
        <div class="mt-3 flex flex-wrap gap-5 text-sm">
          <button
            v-for="c in CIPHERS"
            :key="c.id"
            type="button"
            @click="cipher = c.id"
            class="transition-colors"
            :class="cipher === c.id ? 'text-ink underline underline-offset-4' : 'text-muted hover:text-ink'"
          >
            {{ c.label.toLowerCase() }}
          </button>
        </div>
      </div>

      <div>
        <label class="text-xs uppercase tracking-widest text-muted">passphrase</label>
        <input v-model="passphrase" type="password" :class="[field, 'mt-2']" placeholder="your secret passphrase" />
      </div>

      <div>
        <label class="text-xs uppercase tracking-widest text-muted">
          {{ mode === 'encrypt' ? 'plaintext' : 'ciphertext · base64' }}
        </label>
        <textarea v-model="input" rows="4" :class="[field, 'mt-2 resize-none']" />
      </div>

      <button type="button" @click="run" :disabled="busy" class="bg-ink text-paper rounded-none px-5 py-2.5 text-sm hover:opacity-80 disabled:opacity-40 transition-opacity">
        {{ busy ? 'working…' : mode }}
      </button>

      <p v-if="error" class="text-sm text-accent">{{ error }}</p>

      <div v-if="output">
        <div class="flex items-baseline justify-between">
          <label class="text-xs uppercase tracking-widest text-muted">
            {{ mode === 'encrypt' ? 'ciphertext · base64' : 'plaintext' }}
          </label>
          <CopyButton :value="output" />
        </div>
        <p class="mt-2 break-all text-sm">{{ output }}</p>
      </div>

      <p class="text-xs text-faint leading-relaxed">
        aes-gcm and chacha20-poly1305 are authenticated — tampering is detected. aes-cbc is not; a
        wrong passphrase may return garbage rather than a clear error.
      </p>
    </div>

    <template #about>
      <h2 class="text-base text-ink">Local text encryption and decryption</h2>
      <p class="mt-3">
        Encrypt plaintext with a passphrase or decrypt compatible Base64 ciphertext using AES-GCM,
        AES-CBC, or ChaCha20-Poly1305. Encryption keys are derived locally from your passphrase.
      </p>
      <p class="mt-3">
        AES-GCM and ChaCha20-Poly1305 authenticate the ciphertext and detect modification. AES-CBC
        does not provide authentication and is included only when compatibility requires it. No
        plaintext, passphrase, key, or ciphertext leaves your browser.
      </p>
    </template>
  </UtilityLayout>
</template>
