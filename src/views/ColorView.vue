<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import UtilityLayout from '../components/UtilityLayout.vue'
import CopyButton from '../components/CopyButton.vue'
import {
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  type RGB,
} from '../utils/color'

const rgb = reactive<RGB>({ r: 42, g: 91, b: 215 })
const hexError = ref(false)

const hex = computed(() => rgbToHex(rgb))
const hsl = computed(() => rgbToHsl(rgb))
const hsv = computed(() => rgbToHsv(rgb))

function setRgb(next: RGB) {
  rgb.r = Math.min(255, Math.max(0, Math.round(next.r)))
  rgb.g = Math.min(255, Math.max(0, Math.round(next.g)))
  rgb.b = Math.min(255, Math.max(0, Math.round(next.b)))
}

function onHex(value: string) {
  const parsed = hexToRgb(value)
  hexError.value = parsed === null
  if (parsed) setRgb(parsed)
}
function onSwatch(value: string) {
  const parsed = hexToRgb(value)
  if (parsed) setRgb(parsed)
}
function onRgb(channel: keyof RGB, value: string) {
  const n = Number(value)
  if (!Number.isNaN(n)) setRgb({ ...rgb, [channel]: n })
}
function onHsl(part: 'h' | 's' | 'l', value: string) {
  const n = Number(value)
  if (!Number.isNaN(n)) setRgb(hslToRgb({ ...hsl.value, [part]: n }))
}
function onHsv(part: 'h' | 's' | 'v', value: string) {
  const n = Number(value)
  if (!Number.isNaN(n)) setRgb(hsvToRgb({ ...hsv.value, [part]: n }))
}

const rgbString = computed(() => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)
const hslString = computed(() => `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)`)
const hsvString = computed(() => `hsv(${hsv.value.h}, ${hsv.value.s}%, ${hsv.value.v}%)`)

const num =
  'w-14 bg-transparent border-0 border-b border-line focus:border-accent outline-none rounded-none py-1 text-center tabular-nums'
</script>

<template>
  <UtilityLayout title="color" description="convert between hex, rgb, hsl and hsv.">
    <!-- swatch is the hero -->
    <label
      class="block h-56 cursor-pointer relative overflow-hidden"
      :style="{ backgroundColor: hex }"
    >
      <input
        type="color"
        :value="hex"
        @input="onSwatch(($event.target as HTMLInputElement).value)"
        class="absolute inset-0 opacity-0 cursor-pointer"
      />
    </label>

    <div class="mt-10 space-y-7">
      <div class="flex items-baseline gap-6">
        <span class="w-10 text-xs uppercase tracking-widest text-muted">hex</span>
        <input
          :value="hex"
          @input="onHex(($event.target as HTMLInputElement).value)"
          class="w-40 bg-transparent border-0 border-b border-line focus:border-accent outline-none rounded-none py-1"
        />
        <CopyButton :value="hex" />
        <span v-if="hexError" class="text-xs text-accent">invalid</span>
      </div>

      <div class="flex items-baseline gap-6">
        <span class="w-10 text-xs uppercase tracking-widest text-muted">rgb</span>
        <div class="flex gap-3">
          <input type="number" min="0" max="255" :value="rgb.r" @input="onRgb('r', ($event.target as HTMLInputElement).value)" :class="num" />
          <input type="number" min="0" max="255" :value="rgb.g" @input="onRgb('g', ($event.target as HTMLInputElement).value)" :class="num" />
          <input type="number" min="0" max="255" :value="rgb.b" @input="onRgb('b', ($event.target as HTMLInputElement).value)" :class="num" />
        </div>
        <CopyButton :value="rgbString" />
      </div>

      <div class="flex items-baseline gap-6">
        <span class="w-10 text-xs uppercase tracking-widest text-muted">hsl</span>
        <div class="flex gap-3">
          <input type="number" min="0" max="360" :value="hsl.h" @input="onHsl('h', ($event.target as HTMLInputElement).value)" :class="num" />
          <input type="number" min="0" max="100" :value="hsl.s" @input="onHsl('s', ($event.target as HTMLInputElement).value)" :class="num" />
          <input type="number" min="0" max="100" :value="hsl.l" @input="onHsl('l', ($event.target as HTMLInputElement).value)" :class="num" />
        </div>
        <CopyButton :value="hslString" />
      </div>

      <div class="flex items-baseline gap-6">
        <span class="w-10 text-xs uppercase tracking-widest text-muted">hsv</span>
        <div class="flex gap-3">
          <input type="number" min="0" max="360" :value="hsv.h" @input="onHsv('h', ($event.target as HTMLInputElement).value)" :class="num" />
          <input type="number" min="0" max="100" :value="hsv.s" @input="onHsv('s', ($event.target as HTMLInputElement).value)" :class="num" />
          <input type="number" min="0" max="100" :value="hsv.v" @input="onHsv('v', ($event.target as HTMLInputElement).value)" :class="num" />
        </div>
        <CopyButton :value="hsvString" />
      </div>
    </div>
  </UtilityLayout>
</template>
