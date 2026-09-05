// path: src/apps/farm-b/useFarmBStore.ts

import { create } from 'zustand'
import type { Plot } from '../../core/types'
import { persistFarms, logAuditEvent } from '../../core/syncEngine'
import { useCurrencyStore } from '../../store/useCurrencyStore'

interface FarmBState {
  plots: Plot[]
  tickCount: number
  lastTickAt: number

  plantCrop: (plotIndex: number) => void
  harvestCrop: (plotIndex: number) => number // returns Time earned
  tick: () => void
}

const INITIAL_PLOTS: Plot[] = Array.from({ length: 4 }, () => ({
  cropType: null,
  growthStage: 0,
  plantedAt: null,
}))

export const useFarmBStore = create<FarmBState>()(
  (set, get) => ({
    plots: INITIAL_PLOTS,
    tickCount: 0,
    lastTickAt: Date.now(),

    plantCrop: (plotIndex) => {
      const plots = [...get().plots]
      if (plots[plotIndex].cropType !== null) return
      plots[plotIndex] = {
        cropType: 'sunflower',
        growthStage: 1,
        plantedAt: Date.now(),
      }
      set({ plots })

      persistFarms({ farmB_plots: plots }).catch((err) => {
        console.error('[FarmBStore] Failed to persist plots to backend:', err)
      })
      logAuditEvent('FARM_B_PLANTED', { plotIndex, cropType: 'sunflower' })
    },

    harvestCrop: (plotIndex) => {
      const plot = get().plots[plotIndex]
      if (!plot || plot.growthStage < 4) return 0

      const plots = [...get().plots]
      plots[plotIndex] = { cropType: null, growthStage: 0, plantedAt: null }
      set({ plots })

      const timeEarned = 120 // 120 seconds of Time earned (higher yield!)
      useCurrencyStore.getState().earnTime(timeEarned)

      persistFarms({ farmB_plots: plots }).catch((err) => {
        console.error('[FarmBStore] Failed to persist plots to backend:', err)
      })
      logAuditEvent('FARM_B_HARVESTED', { plotIndex, timeEarned })

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
