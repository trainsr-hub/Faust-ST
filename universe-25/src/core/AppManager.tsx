// path: src/core/AppManager.tsx

import { useGlobalStore } from '../store/useGlobalStore'
import { ImperialHeader } from '../components/ImperialHeader'
import { Hub } from '../apps/hub/Hub'
import { GoldenHour } from '../apps/golden-hour/GoldenHour'
import { FarmA } from '../apps/farm-a/FarmA'
import { FarmB } from '../apps/farm-b/FarmB'
import { VinylAngel } from '../apps/vinyl-angel/VinylAngel'
import { ArtifactCodex } from '../apps/artifact-codex/ArtifactCodex'

/**
 * AppManager renders ALL registered apps simultaneously.
 * Toggles visibility via CSS display: none / block.
 *
 * This guarantees:
 * - Components are NEVER unmounted
 * - Zero re-render cost when switching tabs
 * - Local component state, timers, scroll position perfectly preserved
 */
export function AppManager() {
  const activeApp = useGlobalStore((s) => s.activeApp)

  return (
    <div className="w-full min-h-screen portal-backdrop text-[#f5f0e8] font-inter selection:bg-[#d4af37] selection:text-black">
      <ImperialHeader />

      <div className="w-full">
        <div className={activeApp === 'hub' ? 'app-visible' : 'app-hidden'}>
          <Hub />
        </div>

        <div className={activeApp === 'golden-hour' ? 'app-visible' : 'app-hidden'}>
          <GoldenHour />
        </div>

        <div className={activeApp === 'farm-a' ? 'app-visible' : 'app-hidden'}>
          <FarmA />
        </div>

        <div className={activeApp === 'farm-b' ? 'app-visible' : 'app-hidden'}>
          <FarmB />
        </div>

        <div className={activeApp === 'vinyl-angel' ? 'app-visible' : 'app-hidden'}>
          <VinylAngel />
        </div>

        <div className={activeApp === 'artifact-codex' ? 'app-visible' : 'app-hidden'}>
          <ArtifactCodex />
        </div>
      </div>
    </div>
  )
}
