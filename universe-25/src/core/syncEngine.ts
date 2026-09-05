// path: src/core/syncEngine.ts

import { execute } from './api'
import { useCurrencyStore } from '../store/useCurrencyStore'
import { useInventoryStore } from '../store/useInventoryStore'
import { useGoldenHourStore } from '../apps/golden-hour/store/useGoldenHourStore'
import { useFarmAStore } from '../apps/farm-a/useFarmAStore'
import { useFarmBStore } from '../apps/farm-b/useFarmBStore'
import { useGlobalStore } from '../store/useGlobalStore'
import type { Plot } from './types'
import type { PullItem, ArenaSlot, EnergyReserves } from '../apps/golden-hour/types'

export interface BackendStateData {
  timeBalance?: number
  userProfile?: { name: string; avatar: string; createdAt: string }
  hazardProfile?: { goldenHours: number; hazardLevel: number }
}

export interface BackendInventoryData {
  discs?: number
  solarEssence?: number
  codexFragments?: number
  angelRollTickets?: number
  solarRollTickets?: number
  codexRollTickets?: number
}

export interface BackendVaultData {
  vault?: PullItem[]
  arenaSlots?: ArenaSlot[]
  energyReserves?: EnergyReserves
  totalPulls?: number
}

export interface BackendFarmsData {
  farmA_plots?: Plot[]
  farmB_plots?: Plot[]
}

/**
 * Log an audit event to the backend events.jsonl tier
 */
export async function logAuditEvent(eventType: string, details: Record<string, unknown> = {}): Promise<void> {
  try {
    await execute('events', 'append', undefined, {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      details,
    })
  } catch (err) {
    console.warn(`[SyncEngine] Audit event logging failed: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/**
 * Persist global state (Time balance & user profile)
 */
export async function persistState(data: BackendStateData): Promise<void> {
  const current = (await execute<BackendStateData>('state', 'read_all')).data || {}
  const merged = { ...current, ...data }
  await execute('state', 'overwrite', undefined, merged)
}

/**
 * Persist dimensional inventory & tickets
 */
export async function persistInventory(data: BackendInventoryData): Promise<void> {
  const current = (await execute<BackendInventoryData>('inventory', 'read_all')).data || {}
  const merged = { ...current, ...data }
  await execute('inventory', 'overwrite', undefined, merged)
}

/**
 * Persist master game vault, relics, equipment, and energy reserves
 */
export async function persistVault(data: BackendVaultData): Promise<void> {
  const current = (await execute<BackendVaultData>('vault', 'read_all')).data || {}
  const merged = { ...current, ...data }
  await execute('vault', 'overwrite', undefined, merged)
}

/**
 * Persist agrarian farm plots
 */
export async function persistFarms(data: BackendFarmsData): Promise<void> {
  const current = (await execute<BackendFarmsData>('farms', 'read_all')).data || {}
  const merged = { ...current, ...data }
  await execute('farms', 'overwrite', undefined, merged)
}

/**
 * Hydrates all stores from the authoritative backend storage engine.
 * Throws loudly if the backend is down or fails.
 */
export async function hydrateAllStores(): Promise<{ success: boolean }> {
  // 1. Fetch all backend tiers in parallel
  const [stateRes, invRes, vaultRes, farmsRes] = await Promise.all([
    execute<BackendStateData>('state', 'read_all'),
    execute<BackendInventoryData>('inventory', 'read_all'),
    execute<BackendVaultData>('vault', 'read_all'),
    execute<BackendFarmsData>('farms', 'read_all'),
  ])

  const stateData = stateRes.data || {}
  const invData = invRes.data || {}
  const vaultData = vaultRes.data || {}
  const farmsData = farmsRes.data || {}

  // 2. Hydrate Currency Store (Time Balance)
  if (typeof stateData.timeBalance === 'number') {
    useCurrencyStore.setState({ timeBalance: stateData.timeBalance })
  } else {
    // Initialize default time balance if missing on backend
    await persistState({ timeBalance: 3600 })
    useCurrencyStore.setState({ timeBalance: 3600 })
  }

  // 3. Hydrate Global Profile
  if (stateData.userProfile) {
    useGlobalStore.setState({ userProfile: stateData.userProfile })
  }

  // 4. Hydrate Inventory Store (Discs, Essence, Tickets)
  useInventoryStore.setState({
    discs: invData.discs ?? 0,
    solarEssence: invData.solarEssence ?? 0,
    codexFragments: invData.codexFragments ?? 0,
    angelRollTickets: invData.angelRollTickets ?? 0,
    solarRollTickets: invData.solarRollTickets ?? 0,
    codexRollTickets: invData.codexRollTickets ?? 0,
  })

  // 5. Hydrate Golden Hour Store (Vault, Energy, Arena Slots, Pulls)
  useGoldenHourStore.setState((prev) => ({
    vault: vaultData.vault ?? prev.vault,
    arenaSlots: vaultData.arenaSlots ?? prev.arenaSlots,
    energyReserves: vaultData.energyReserves ?? prev.energyReserves,
    totalPulls: vaultData.totalPulls ?? prev.totalPulls,
  }))

  // 6. Hydrate Farm Plots
  if (farmsData.farmA_plots && Array.isArray(farmsData.farmA_plots)) {
    useFarmAStore.setState({ plots: farmsData.farmA_plots })
  }
  if (farmsData.farmB_plots && Array.isArray(farmsData.farmB_plots)) {
    useFarmBStore.setState({ plots: farmsData.farmB_plots })
  }

  // 7. Log successful hydration audit
  await logAuditEvent('SESSION_HYDRATED', {
    timeBalance: useCurrencyStore.getState().timeBalance,
    totalVaultItems: useGoldenHourStore.getState().vault.length,
    angelTickets: useInventoryStore.getState().angelRollTickets,
    solarTickets: useInventoryStore.getState().solarRollTickets,
    codexTickets: useInventoryStore.getState().codexRollTickets,
  })

  return { success: true }
}
