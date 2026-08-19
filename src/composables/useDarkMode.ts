import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'du:theme'

// Shared across all callers.
const isDark = ref(false)

function apply(dark: boolean) {
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
}

/**
 * Light default, dark toggle. Preference persisted to localStorage; falls back
 * to the OS `prefers-color-scheme` on first visit.
 */
export function useDarkMode() {
  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') {
      apply(stored === 'dark')
    } else {
      apply(window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false)
    }
  })

  function toggle() {
    const next = !isDark.value
    apply(next)
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
  }

  return { isDark, toggle }
}
