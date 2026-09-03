// path: src/apps/farm-b/useFarmBStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Plot } from '../../core/types'

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
  persist(
    (set, get) => ({
      plots: INITIAL_PLOTS,
      tickCount: 0,
      lastTickAt: Date.now(),

      plantCrop: (plotIndex) => {
        set((s) => {
          const plots = [...s.plots]
          if (plots[plotIndex].cropType !== null) return s
          plots[plotIndex] = {
            cropType: 'sunflower',
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

        return 120 // 120 seconds of Time earned (higher yield!)
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
    { name: 'universe25-farm-b' },
  ),
)
