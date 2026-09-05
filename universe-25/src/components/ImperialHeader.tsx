// Imperial Header Component - Gate of Babylon Style with Fail-Loudly Status Banner
import { Crown, Sparkles, RefreshCw, Radio, AlertTriangle } from 'lucide-react'
import { useBackendStatus } from '../hooks/useBackendStatus'
import { useGlobalStore, APP_REGISTRY } from '../store/useGlobalStore'

export function ImperialHeader() {
  const { isOnline, lastError, isChecking, checkStatus } = useBackendStatus()
  const activeApp = useGlobalStore((s) => s.activeApp)
  const setActiveApp = useGlobalStore((s) => s.setActiveApp)
  const loadFromBackend = useGlobalStore((s) => s.loadFromBackend)
  const isLoaded = useGlobalStore((s) => s.isLoaded)

  const currentApp = APP_REGISTRY.find((app) => app.id === activeApp)

  const handleRetry = async () => {
    await checkStatus()
    await loadFromBackend()
  }

  return (
    <header className="relative border-b border-[#2d2438] bg-[#0a080e]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Critical Offline Banner - Fail-Loudly Anti-Silent Mode */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-red-950/90 via-red-900/90 to-red-950/90 border-b border-red-600/60 px-6 py-2.5 text-red-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
            <div>
              <span className="font-cinzel font-bold text-white tracking-wider uppercase mr-2">
                [Backend Storage Engine Offline]
              </span>
              <span className="text-red-300 font-mono">
                {lastError || 'Cannot connect to storage engine at http://localhost:8080. Durable game data will not synchronize.'}
              </span>
            </div>
          </div>
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-800 hover:bg-red-700 text-white font-cinzel font-bold text-xs border border-red-500 transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Reconnect</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/30 to-[#841822]/30 border border-[#d4af37] shadow-gold-sm">
            <Crown className="w-6 h-6 text-[#ffd86b] animate-pulse-slow" />
            <div className="absolute inset-0 rounded-xl border border-[#ffd86b]/40 animate-ping opacity-20 pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel-dec font-bold text-lg md:text-xl tracking-[3px] gold-text-gradient uppercase">
                Universe 25
              </h1>
              <span className="text-[10px] font-cinzel font-bold px-2 py-0.5 rounded bg-[#1e1726] border border-[#524124] text-[#ffd86b]">
                宇宙25
              </span>
            </div>
            <p className="text-xs text-[#9c93a8] font-cinzel tracking-wider">
              Autonomous Web Operating System • Blue Rose Engine
            </p>
          </div>
        </div>

        {/* Status & Controls */}
        <div className="flex items-center gap-3">
          {/* Backend Status Indicator */}
          <div className={`px-3.5 py-1.5 rounded-lg border flex items-center gap-2.5 text-xs ${
            isOnline
              ? 'bg-[#14101c] border-[#33283f]'
              : 'bg-red-950/40 border-red-600/50'
          }`}>
            <Radio
              className={`w-4 h-4 ${
                isOnline
                  ? 'text-emerald-400 animate-pulse'
                  : 'text-red-500 animate-ping'
              }`}
            />
            <span className="text-[#9c93a8]">Storage:</span>
            <span className={`font-mono font-bold ${
              isOnline
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}>
              {isOnline ? 'ONLINE' : 'DISCONNECTED'}
            </span>
          </div>

          {/* Sync Status */}
          <div className="px-3.5 py-1.5 rounded-lg bg-[#14101c] border border-[#33283f] flex items-center gap-2.5 text-xs">
            <span className="text-[#9c93a8]">Sync:</span>
            <span className={`font-mono font-bold ${isLoaded ? 'text-[#ffd86b]' : 'text-amber-400'}`}>
              {isLoaded ? 'HYDRATED' : 'PENDING'}
            </span>
          </div>

          {/* Apps Mounted */}
          <div className="px-3.5 py-1.5 rounded-lg bg-[#14101c] border border-[#33283f] flex items-center gap-2.5 text-xs">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            <span className="text-[#9c93a8]">Apps:</span>
            <span className="font-mono font-bold text-[#ffd86b]">{APP_REGISTRY.length}</span>
          </div>

          {/* Refresh / Reconnect Button */}
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1a1424] hover:bg-[#261d36] border border-[#524124] text-[#ffd86b] text-xs font-semibold shadow-gold-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span className="font-cinzel">Sync</span>
          </button>
        </div>
      </div>

      {/* App Navigation Tabs */}
      {activeApp !== 'hub' && (
        <div className="max-w-7xl mx-auto px-6 pb-3">
          <div className="flex items-center justify-between gap-4 border-b border-[#231b2e] pb-3">
            <nav className="flex flex-wrap gap-2.5">
              {APP_REGISTRY.map((app) => {
                const isActive = app.id === activeApp
                return (
                  <button
                    key={app.id}
                    onClick={() => setActiveApp(app.id)}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-cinzel text-xs md:text-sm font-bold tracking-wider transition ${
                      isActive
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8214] text-black shadow-gold-md'
                        : 'bg-[#120f18] text-[#9c93a8] hover:text-white border border-[#2b2238] hover:border-[#524124]'
                    }`}
                  >
                    <span className="text-lg">{app.icon}</span>
                    <span>{app.name}</span>
                  </button>
                )
              })}
            </nav>

            <div className="flex items-center gap-2 text-xs font-mono text-[#9c93a8]">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Active: <strong className="text-white">{currentApp?.name || 'Hub'}</strong></span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
