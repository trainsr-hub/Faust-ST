// path: src/apps/farm-a/FarmA.tsx

import { useEffect } from 'react'
import { useGlobalStore } from '../../store/useGlobalStore'
import { useCurrencyStore } from '../../store/useCurrencyStore'
import { useFarmAStore } from './useFarmAStore'

export function FarmA() {
  const setActiveApp = useGlobalStore((s) => s.setActiveApp)
  const earnTime = useCurrencyStore((s) => s.earnTime)
  const timeBalance = useCurrencyStore((s) => s.timeBalance)
  const spendTime = useCurrencyStore((s) => s.spendTime)

  const { plots, tickCount, plantCrop, harvestCrop, tick } = useFarmAStore()

  // Auto-tick every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      tick()
    }, 5000)
    return () => clearInterval(interval)
  }, [tick])

  const handlePlant = (index: number) => {
    if (!spendTime(60)) {
      alert('Not enough Time! Need 60 seconds to plant.')
      return
    }
    plantCrop(index)
  }

  const handleHarvest = (index: number) => {
    const earned = harvestCrop(index)
    if (earned > 0) {
      earnTime(earned)
    }
  }

  const getStageLabel = (stage: number) => {
    switch (stage) {
      case 0: return '🟫 Empty Plot'
      case 1: return '🌱 Seed Planted'
      case 2: return '🌿 Young Sprout'
      case 3: return '🌾 Maturing'
      case 4: return '✨ Ready for Harvest!'
      default: return '?'
    }
  }

  return (
    <div className="min-h-screen portal-backdrop" style={{ background: 'var(--bg-primary)', padding: '2rem' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header with Navigation */}
        <header className="mb-10 fade-in">
          <button
            onClick={() => setActiveApp('hub')}
            className="mb-6 btn-secondary flex items-center gap-2"
          >
            ← Return to Hub
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2" style={{
                background: 'linear-gradient(135deg, #34d399 0%, var(--accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                🌾 Farm Alpha
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Automated Bio-Synthesis & Time Generation Matrix
              </p>
            </div>

            <div className="p-4 rounded-xl glass card-glow text-right">
              <p className="text-xs uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Vault Balance</p>
              <p className="text-2xl font-black" style={{ color: 'var(--accent)' }}>⏱️ {timeBalance.toFixed(0)}s</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tick Cycle: #{tickCount}</p>
            </div>
          </div>
        </header>

        {/* Info Card */}
        <div
          className="p-6 mb-8 card-glow glass"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">💡</span>
            <div>
              <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Farm Operations</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Planting costs <strong>60 Time</strong>. Mature crops yield <strong>30 Time</strong>.
                Plots auto-advance growth stages every 5 seconds, running seamlessly in the background.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Plots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plots.map((plot, i) => (
            <div
              key={i}
              className={`p-6 text-center card-glow flex flex-col justify-between ${plot.growthStage === 4 ? 'success-glow' : ''}`}
              style={{
                background: 'var(--bg-card)',
                border: `2px solid ${plot.growthStage === 4 ? 'var(--success)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                minHeight: '220px'
              }}
            >
              <div>
                <div className="text-5xl mb-3 float">
                  {plot.cropType ? (plot.growthStage === 4 ? '✨' : '🌾') : '🟫'}
                </div>
                <h4 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Plot #{i + 1}
                </h4>
                <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {getStageLabel(plot.growthStage)}
                </p>
              </div>

              <div>
                {plot.cropType === null ? (
                  <button
                    onClick={() => handlePlant(i)}
                    className="btn-primary w-full"
                  >
                    Plant (60s)
                  </button>
                ) : plot.growthStage >= 4 ? (
                  <button
                    onClick={() => handleHarvest(i)}
                    className="btn-primary w-full"
                    style={{ background: 'var(--success)' }}
                  >
                    Harvest (+30s)
                  </button>
                ) : (
                  <div className="p-3 rounded-lg shimmer" style={{ background: 'var(--bg-elevated)' }}>
                    <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                      GROWING... Stage {plot.growthStage}/4
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
