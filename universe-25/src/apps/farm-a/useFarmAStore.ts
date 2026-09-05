// path: src/apps/farm-a/useFarmAStore.ts

import { create } from 'zustand'
import type { Plot } from '../../core/types'
import { persistFarms, logAuditEvent } from '../../core/syncEngine'
import { useCurrencyStore } from '../../store/useCurrencyStore'

interface FarmAState {
  plots: Plot[]
  tickCount: number
  lastTickAt: number

  plantCrop: (plotIndex: number) => void
  harvestCrop: (plotIndex: number) => number // returns Time earned
  tick: () => void
}

const INITIAL_PLOTS: Plot[] = Array.from({ length: 6 }, () => ({
  cropType: null,
  growthStage: 0,
  plantedAt: null,
}))

export const useFarmAStore = create<FarmAState>()(
  (set, get) => ({
    plots: INITIAL_PLOTS,
    tickCount: 0,
    lastTickAt: Date.now(),

    plantCrop: (plotIndex) => {
      const plots = [...get().plots]
      if (plots[plotIndex].cropType !== null) return // already planted
      plots[plotIndex] = {
        cropType: 'wheat',
        growthStage: 1,
        plantedAt: Date.now(),
      }
      set({ plots })

      persistFarms({ farmA_plots: plots }).catch((err) => {
        console.error('[FarmAStore] Failed to persist plots to backend:', err)
      })
      logAuditEvent('FARM_A_PLANTED', { plotIndex, cropType: 'wheat' })
    },

    harvestCrop: (plotIndex) => {
      const plot = get().plots[plotIndex]
      if (!plot || plot.growthStage < 4) return 0

      const plots = [...get().plots]
      plots[plotIndex] = { cropType: null, growthStage: 0, plantedAt: null }
      set({ plots })

      const timeEarned = 30 // 30 seconds of Time earned per harvest
      useCurrencyStore.getState().earnTime(timeEarned)

      persistFarms({ farmA_plots: plots }).catch((err) => {
        console.error('[FarmAStore] Failed to persist plots to backend:', err)
      })
      logAuditEvent('FARM_A_HARVESTED', { plotIndex, timeEarned })

      return timeEarned
    },

    tick: () => {
      set((s) => {
        const plots = s.plots.map((plot) => {
          if (plot.cropType && plot.growthStage < 4) {
            return { ...plot, growthStage: plot.growthStage + 1 }
          }
          return plot
        })
        return { plots, tickCount: s.tickCount + 1, lastTickAt: Date.now() }
      })
    },
  })
)
