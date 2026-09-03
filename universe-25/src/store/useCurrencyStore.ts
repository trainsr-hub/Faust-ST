// path: src/store/useCurrencyStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CurrencyState {
  /** Universal currency — Time in seconds */
  timeBalance: number

  /** Earn Time (add seconds) */
  earnTime: (seconds: number) => void

  /** Spend Time. Returns false if insufficient balance. */
  spendTime: (seconds: number) => boolean

  /** Format Time for display: "2h 15m 30s" */
  formatTime: (seconds?: number) => string
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      timeBalance: 600, // Start with 10 minutes

      earnTime: (seconds) =>
        set((s) => ({ timeBalance: s.timeBalance + seconds })),

      spendTime: (seconds) => {
        if (get().timeBalance < seconds) return false
        set((s) => ({ timeBalance: s.timeBalance - seconds }))
        return true
      },

      formatTime: (seconds) => {
        const total = seconds ?? get().timeBalance
        const h = Math.floor(total / 3600)
        const m = Math.floor((total % 3600) / 60)
        const s = total % 60
        const parts: string[] = []
        if (h > 0) parts.push(`${h}h`)
        if (m > 0) parts.push(`${m}m`)
        parts.push(`${Math.floor(s)}s`)
        return parts.join(' ')
      },
    }),
    { name: 'universe25-currency' },
  ),
)
