// path: src/apps/hub/Hub.tsx

import { useGlobalStore, APP_REGISTRY } from '../../store/useGlobalStore'
import { useCurrencyStore } from '../../store/useCurrencyStore'
import { useThemeStore } from '../../store/useThemeStore'
import { THEMES_REGISTRY } from '../../themes/themes.registry'
import { Crown, Sparkles } from 'lucide-react'

export function Hub() {
  const setActiveApp = useGlobalStore((s) => s.setActiveApp)
  const timeBalance = useCurrencyStore((s) => s.timeBalance)
  const formatTime = useCurrencyStore((s) => s.formatTime)

  const { activeThemeId, setActiveTheme, isUnlocked, unlockTheme } = useThemeStore()

  return (
    <div className="min-h-screen" style={{ padding: '2rem' }}>
      <div className="max-w-7xl mx-auto">

        {/* Enhanced Currency Display */}
        <div
          className="p-8 mb-10 card-glow"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm mb-2 uppercase tracking-wider font-cinzel" style={{ color: 'var(--text-muted)', fontWeight: '600' }}>
                Universal Currency
              </p>
              <p className="text-5xl font-black mb-1" style={{ color: 'var(--accent)' }}>
                ⏱️ {formatTime(timeBalance)}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {timeBalance.toFixed(0)} seconds in vault
              </p>
            </div>
            <div className="w-32 h-32 rounded-full pulse-glow flex items-center justify-center" style={{
              background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
              border: '2px solid var(--accent)'
            }}>
              <span className="text-5xl">⏱️</span>
            </div>
          </div>
        </div>

        {/* App Grid - Gate of Babylon Style */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-[#d4af37]" />
            <h2 className="text-3xl font-bold font-cinzel" style={{ color: 'var(--text-primary)' }}>
              Treasury Applications
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {APP_REGISTRY.filter((app) => app.id !== 'hub').map((app, idx) => (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className="p-7 text-left golden-border-glow group"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow)',
                  animationDelay: `${idx * 100}ms`
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl float">{app.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1 font-cinzel group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {app.name}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {app.description}
                    </p>
                  </div>
                  <div className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }}>
                    →
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
                  <span className="font-mono">READY</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Enhanced Theme Switcher */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-6 h-6 text-[#d4af37]" />
            <h2 className="text-3xl font-bold font-cinzel" style={{ color: 'var(--text-primary)' }}>
              Visual Themes
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {Object.values(THEMES_REGISTRY).map((theme) => (
              <div
                key={theme.id}
                className="p-6 golden-border-glow"
                style={{
                  background: 'var(--bg-card)',
                  border: `2px solid ${activeThemeId === theme.id ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  opacity: isUnlocked(theme.id) ? 1 : 0.6,
                  boxShadow: activeThemeId === theme.id ? 'var(--shadow-gold-md)' : 'var(--shadow)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{theme.icon}</span>
                  {activeThemeId === theme.id && (
                    <span className="status-badge active">
                      ✓ ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold font-cinzel mb-4" style={{ color: 'var(--text-primary)' }}>
                  {theme.name}
                </h3>
                {isUnlocked(theme.id) ? (
                  <button
                    onClick={() => setActiveTheme(theme.id)}
                    disabled={activeThemeId === theme.id}
                    className={activeThemeId === theme.id ? 'btn-secondary w-full' : 'btn-primary w-full'}
                    style={{
                      opacity: activeThemeId === theme.id ? 0.6 : 1,
                      cursor: activeThemeId === theme.id ? 'default' : 'pointer',
                    }}
                  >
                    {activeThemeId === theme.id ? '✓ Selected' : 'Apply Theme'}
                  </button>
                ) : (
                  <button
                    onClick={() => unlockTheme(theme.id)}
                    className="btn-secondary w-full"
                  >
                    🔒 Unlock
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
