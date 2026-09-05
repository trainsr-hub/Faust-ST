// path: src/apps/farm-b/FarmB.tsx

import { useEffect } from 'react'
import { useGlobalStore } from '../../store/useGlobalStore'
import { useCurrencyStore } from '../../store/useCurrencyStore'
import { useFarmBStore } from './useFarmBStore'

export function FarmB() {
  const setActiveApp = useGlobalStore((s) => s.setActiveApp)
  const earnTime = useCurrencyStore((s) => s.earnTime)
  const timeBalance = useCurrencyStore((s) => s.timeBalance)
  const spendTime = useCurrencyStore((s) => s.spendTime)

  const { plots, tickCount, plantCrop, harvestCrop, tick } = useFarmBStore()

  // Auto-tick every 8 seconds (slower, higher value)
  useEffect(() => {
    const interval = setInterval(() => {
      tick()
    }, 8000)
    return () => clearInterval(interval)
  }, [tick])

  const handlePlant = (index: number) => {
    if (!spendTime(180)) {
      alert('Not enough Time! Need 180 seconds to plant Sunflowers.')
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
      case 1: return '🌱 Solar Seed'
      case 2: return '🌿 Solar Stalk'
      case 3: return '🌻 Solar Bloom'
      case 4: return '✨ Golden Radiant!'
      default: return '?'
    }
  }

  return (
    <div className="min-h-screen portal-backdrop" style={{ background: 'var(--bg-primary)', padding: '2rem' }}>
      <div className="max-w-7xl mx-auto w-full">
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
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                🌻 Farm Beta (Exotic)
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                High-Yield Solar Flora & Exotic Essence Synthesizer
              </p>
            </div>

            <div className="p-4 rounded-xl glass card-glow text-right">
              <p className="text-xs uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Vault Balance</p>
              <p className="text-2xl font-black" style={{ color: 'var(--warning)' }}>⏱️ {timeBalance.toFixed(0)}s</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Solar Cycle: #{tickCount}</p>
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
            <span className="text-3xl">☀️</span>
            <div>
              <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Exotic Solar Flora</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Exotic planting costs <strong>180 Time</strong>. High-yield harvest awards <strong>120 Time</strong>.
                Growth occurs every 8 seconds per solar tick.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Plots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {plots.map((plot, i) => (
            <div
              key={i}
              className={`p-6 text-center card-glow flex flex-col justify-between ${plot.growthStage === 4 ? 'pulse-glow' : ''}`}
              style={{
                background: 'var(--bg-card)',
                border: `2px solid ${plot.growthStage === 4 ? 'var(--warning)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                minHeight: '240px'
              }}
            >
              <div>
                <div className="text-6xl mb-3 float">
                  {plot.cropType ? (plot.growthStage === 4 ? '🌟' : '🌻') : '🟫'}
                </div>
                <h4 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Solar Hydroponic Pod #{i + 1}
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
                    style={{ background: 'var(--warning)', color: '#000' }}
                  >
                    Plant Solar (180s)
                  </button>
                ) : plot.growthStage >= 4 ? (
                  <button
                    onClick={() => handleHarvest(i)}
                    className="btn-primary w-full"
                    style={{ background: '#f59e0b', color: '#000' }}
                  >
                    Harvest Essence (+120s)
                  </button>
                ) : (
                  <div className="p-3 rounded-lg shimmer" style={{ background: 'var(--bg-elevated)' }}>
                    <span className="text-xs font-bold" style={{ color: 'var(--warning)' }}>
                      HARVESTING LIGHT... Stage {plot.growthStage}/4
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
