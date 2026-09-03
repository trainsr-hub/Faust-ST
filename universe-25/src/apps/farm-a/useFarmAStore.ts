// path: src/apps/farm-a/useFarmAStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Plot } from '../../core/types'

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
  persist(
    (set, get) => ({
      plots: INITIAL_PLOTS,
      tickCount: 0,
      lastTickAt: Date.now(),

      plantCrop: (plotIndex) => {
        set((s) => {
          const plots = [...s.plots]
          if (plots[plotIndex].cropType !== null) return s // already planted
          plots[plotIndex] = {
            cropType: 'wheat',
            growthStage: 1,
            plantedAt: Date.now(),
          }
          return { plots }
        })
      },

      harvestCrop: (plotIndex) => {
        const plot = get().plots[plotIndex]
        if (!plot || plot.growthStage < 4) return 0

        set((s) => {
          const plots = [...s.plots]
          plots[plotIndex] = { cropType: null, growthStage: 0, plantedAt: null }
          return { plots }
        })

        return 30 // 30 seconds of Time earned per harvest
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
    }),
    { name: 'universe25-farm-a' },
  ),
)
