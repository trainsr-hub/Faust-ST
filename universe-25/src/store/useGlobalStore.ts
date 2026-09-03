// path: src/store/useGlobalStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { execute } from '../core/api'
import type { AppManifest } from '../core/types'

/** All apps registered in Universe 25. Add new apps here. */
export const APP_REGISTRY: AppManifest[] = [
  { id: 'hub', name: 'Hub', icon: '🏠', description: 'Navigation Hub' },
  { id: 'farm-a', name: 'Farm Alpha', icon: '🌾', description: 'Grow crops, earn Time' },
  { id: 'farm-b', name: 'Farm Beta', icon: '🌻', description: 'Exotic crops, bigger yields' },
  { id: 'vinyl-angel', name: 'Vinyl Angel', icon: '💿', description: 'Autonomous Music Laboratory' },
  { id: 'artifact-codex', name: 'Artifact Codex', icon: '📖', description: 'Hazard Matrix & Rank Visualizer' },
]

interface GlobalState {
  // Navigation
  activeApp: string
  setActiveApp: (appId: string) => void

  // User profile
  userProfile: { name: string; avatar: string; createdAt: string } | null
  setUserProfile: (profile: GlobalState['userProfile']) => void

  // Sync
  isLoaded: boolean
  isSaving: boolean
  lastSavedAt: string | null

  // Backend I/O
  loadFromBackend: () => Promise<void>
  saveToBackend: (snapshot: Record<string, unknown>) => Promise<void>
}

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      activeApp: 'hub',
      setActiveApp: (appId) => set({ activeApp: appId }),

      userProfile: null,
      setUserProfile: (profile) => set({ userProfile: profile }),

      isLoaded: false,
      isSaving: false,
      lastSavedAt: null,

      loadFromBackend: async () => {
        try {
          const res = await execute<Record<string, unknown>>('state', 'read_all')
          const data = res.data || {}

          if (data.userProfile) {
            set({ userProfile: data.userProfile as GlobalState['userProfile'] })
          }
          set({ isLoaded: true })
          return
        } catch {
          // Backend not available — that's fine, we run local-first
          set({ isLoaded: true })
        }
      },

      saveToBackend: async (snapshot) => {
        set({ isSaving: true })
        try {
          await execute('state', 'overwrite', undefined, snapshot)
          set({ isSaving: false, lastSavedAt: new Date().toISOString() })
        } catch (err) {
          set({ isSaving: false })
          throw err
        }
      },
    }),
    { name: 'universe25-global' },
  ),
)
