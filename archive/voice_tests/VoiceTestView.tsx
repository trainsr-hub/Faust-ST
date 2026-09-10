import React, { useState, useEffect, useMemo } from 'react'
import AudioFeedback from './AudioFeedback'

export const VoiceTestView: React.FC = () => {
  const [text, setText] = useState('Faust online. Awaiting your directive, Manager.')
  const [voice, setVoice] = useState('af_bella')
  const [speed, setSpeed] = useState(0.84)
  const [pitch, setPitch] = useState(-0.3) // Pitch shift in semitones (negative for nonchalant tone)
  const [language, setLanguage] = useState('en-us')
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [availableVoices, setAvailableVoices] = useState<string[]>([])
  const [rating, setRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [voicesLoaded, setVoicesLoaded] = useState(false)

  // Filter to only female voices (exclude male voices: am, bm, em, hm, im, jm, pm, zm)
  const femaleVoices = useMemo(() => {
    return availableVoices.filter(v => {
      if (!v) return false
      const prefix = v.slice(0, 2)
      return !['am', 'bm', 'em', 'hm', 'im', 'jm', 'pm', 'zm'].includes(prefix)
    })
  }, [availableVoices])

  // Current index in femaleVoices
  const femaleVoiceIndex = useMemo(() => {
    const idx = femaleVoices.indexOf(voice)
    return idx >= 0 ? idx : 0
  }, [femaleVoices, voice])

  useEffect(() => {
    fetchAvailableVoices()
  }, [])

  const fetchAvailableVoices = async () => {
    try {
      const response = await fetch('/api/v1/voice/voices')
      if (response.ok) {
        const data = await response.json()
        const rawVoices: string[] = data.available_voices || []
        setAvailableVoices(rawVoices)

        // Filter and pick default female voice - prefer blunt voices for Faust
        const females = rawVoices.filter((v: string) => {
          const prefix = v.slice(0, 2)
          return !['am', 'bm', 'em', 'hm', 'im', 'jm', 'pm', 'zm'].includes(prefix)
        })

        // Prefer blunt/neutral voices: af_alloy, af_kore, af_nova, af_sky, bf_alice, bf_emma, bf_isabella
        const bluntPreferences = ['af_alloy', 'af_kore', 'af_nova', 'af_sky', 'bf_alice', 'bf_emma', 'bf_isabella']
        let selectedVoice = females.find(v => bluntPreferences.includes(v))
        if (!selectedVoice && females.length > 0) {
          selectedVoice = females[0] // fallback to first female
        } else if (!selectedVoice && rawVoices.length > 0) {
          selectedVoice = rawVoices[0] // fallback to any voice
        }
        setVoice(selectedVoice || 'af_alloy')

        setVoicesLoaded(true)
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error)
    }
  }

  const handleNextVoice = () => {
    if (femaleVoices.length === 0) return
    const nextIdx = (femaleVoiceIndex + 1) % femaleVoices.length
    setVoice(femaleVoices[nextIdx])
  }

  const handlePrevVoice = () => {
    if (femaleVoices.length === 0) return
    const prevIdx = (femaleVoiceIndex - 1 + femaleVoices.length) % femaleVoices.length
    setVoice(femaleVoices[prevIdx])
  }

  const generateVoice = async () => {
    setIsGenerating(true)
    try {
      console.log('Voice request speed:', speed, typeof speed)
      const response = await fetch('/api/v1/voice/tune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
          speed: parseFloat(speed.toFixed(2)), // Ensure 2 decimal precision
          language,
          pitch_shift: parseFloat(pitch.toFixed(1)) // Ensure 1 decimal precision for pitch
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      // Auto-play the generated audio
      const audio = new Audio(url)
      audio.play().catch(e => console.error('Playback failed:', e))
    } catch (error: any) {
      console.error('Voice generation failed:', error)
      alert('Failed to generate voice: ' + (error?.message || 'Unknown error'))
    } finally {
      setIsGenerating(false)
    }
  }

  const submitFeedback = async () => {
    if (rating === null) {
      alert('Please provide a rating before submitting feedback')
      return
    }

    setIsSubmittingFeedback(true)
    try {
      console.log('Voice feedback submitted:', {
        voice,
        speed,
        language,
        text,
        rating,
        feedback,
        timestamp: new Date().toISOString()
      })

      alert('Thank you for your feedback! Your rating has been recorded.')
      setRating(null)
      setFeedback('')
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      alert('Failed to submit feedback')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play().catch(e => console.error('Playback failed:', e))
    }
  }

  if (!voicesLoaded) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="ml-4">Loading available voices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-slate-100">
          Faust Voice Testing & Tuning
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Find the perfect acoustic signature for Faust's nonchalant, analytical persona
        </p>
      </div>

      {/* Voice Controls */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Text Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Text to Synthesize
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text for Faust to speak..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-700 rounded bg-slate-900/50 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Voice Selection with Quick Next/Previous */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Voice Preset (Female Only)
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevVoice}
              disabled={isGenerating || femaleVoices.length === 0}
              className="w-10 h-10 flex items-center justify-center border border-slate-700 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-lg font-bold disabled:opacity-40 transition-colors"
              title="Previous Female Voice"
            >
              ‹
            </button>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-700 rounded bg-slate-900/50 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
            >
              {femaleVoices.map((v) => (
                <option key={v} value={v}>
                  {(v || '').toUpperCase()}
                </option>
              ))}
            </select>
            <button
              onClick={handleNextVoice}
              disabled={isGenerating || femaleVoices.length === 0}
              className="w-10 h-10 flex items-center justify-center border border-slate-700 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-lg font-bold disabled:opacity-40 transition-colors"
              title="Next Female Voice"
            >
              ›
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-400 font-mono">
            Selected: <span className="text-amber-400 font-bold">{(voice || '').toUpperCase()}</span> {femaleVoices.length > 0 ? `(${femaleVoiceIndex + 1}/${femaleVoices.length} female voices)` : ''}
          </p>
        </div>

        {/* Speed Control */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Speech Speed (<span className="font-mono text-amber-400">{speed.toFixed(2)}x</span>)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.6"
              max="1.2"
              step="0.01"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded accent-amber-500"
            />
            <button
              onClick={() => setSpeed(parseFloat(Math.min(1.2, speed + 0.01).toFixed(2)))}
              disabled={isGenerating}
              className="w-8 h-8 flex items-center justify-center border border-slate-700 rounded hover:bg-slate-800/50 disabled:opacity-50 text-xs font-mono"
            >
              +0.01
            </button>
            <button
              onClick={() => setSpeed(parseFloat(Math.max(0.6, speed - 0.01).toFixed(2)))}
              disabled={isGenerating}
              className="w-8 h-8 flex items-center justify-center border border-slate-700 rounded hover:bg-slate-800/50 disabled:opacity-50 text-xs font-mono"
            >
              -0.01
            </button>
          </div>
        </div>

        {/* Pitch Control */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Pitch Shift (<span className="font-mono text-amber-400">{pitch.toFixed(1)}st</span>)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-3"
              max="3"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded accent-amber-500"
            />
            <button
              onClick={() => setPitch(parseFloat(Math.min(3, pitch + 0.1).toFixed(1)))}
              disabled={isGenerating}
              className="w-8 h-8 flex items-center justify-center border border-slate-700 rounded hover:bg-slate-800/50 disabled:opacity-50 text-xs font-mono"
            >
              +0.1
            </button>
            <button
              onClick={() => setPitch(parseFloat(Math.max(-3, pitch - 0.1).toFixed(1)))}
              disabled={isGenerating}
              className="w-8 h-8 flex items-center justify-center border border-slate-700 rounded hover:bg-slate-800/50 disabled:opacity-50 text-xs font-mono"
            >
              -0.1
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-400 font-mono">
            Negative values = deeper voice, Positive = higher pitch
          </p>
        </div>

        {/* Language Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            Language / Accent
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-slate-700 rounded bg-slate-900/50 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
          >
            <option value="en-us">American English (en-us)</option>
            <option value="en-gb">British English (en-gb)</option>
            <option value="en-au">Australian English (en-au)</option>
            <option value="en-in">Indian English (en-in)</option>
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={generateVoice}
          disabled={isGenerating}
          className="w-full md:w-56 px-4 py-2.5 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg font-medium font-mono text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <span>Generate & Play Voice</span>
            </>
          )}
        </button>
      </div>

      {/* Audio Preview */}
      {audioUrl && (
        <div className="border-t border-slate-800 pt-4">
          <h3 className="mb-2 text-sm font-medium text-slate-200 font-mono">
            Audio Playback & Download
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={playAudio}
              className="flex items-center gap-2 px-3 py-1.5 border border-slate-700 rounded bg-slate-900 hover:bg-slate-800 text-sm font-mono text-cyan-300"
            >
              ▶️ Replay Audio
            </button>
            <button
              onClick={() => {
                const link = document.createElement('a')
                link.href = audioUrl
                link.download = `faust_voice_${voice}_speed${speed}.wav`
                link.click()
              }}
              className="flex items-center gap-2 px-3 py-1.5 border border-slate-700 rounded bg-slate-900 hover:bg-slate-800 text-sm font-mono text-slate-300"
            >
              💾 Save WAV
            </button>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="mb-2 text-sm font-medium text-slate-200 font-mono">
          Rate This Sound Profile
        </h3>
        <div className="space-y-4">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-200">
              Score:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    setRating(star);
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded text-base transition-colors
                    ${rating !== null && rating >= star
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800/50 border border-slate-800'}`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating !== null && (
              <span className="ml-2 text-xs font-mono text-amber-400">
                ({rating}/5 Stars)
              </span>
            )}
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Evaluation Notes (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Record impressions regarding timbre, delivery cadence, authority, or analytical tone..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-700 rounded bg-slate-900/50 text-slate-200 focus:outline-none focus:border-amber-500 text-sm"
              disabled={isSubmittingFeedback}
            />
          </div>

          {/* Submit Feedback Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                submitFeedback();
              }}
              disabled={rating === null || isSubmittingFeedback}
              className="px-4 py-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40 rounded font-medium text-sm font-mono disabled:opacity-50 transition-all"
            >
              {isSubmittingFeedback ? (
                <>
                  <div className="mr-2 h-4 w-4 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin inline-block"></div>
                  Recording...
                </>
              ) : (
                <>
                  💬 Submit Evaluation
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Audio Feedback for interactions */}
      <AudioFeedback trigger={rating} type="click" />
      <AudioFeedback trigger={isSubmittingFeedback} type="confirm" />
      <AudioFeedback trigger={audioUrl} type="complete" />

      {/* Tips Section */}
      <div className="border-t border-slate-800 pt-4 bg-slate-950/50 rounded-lg p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Faust Acoustic Tuning Directives
        </h3>
        <ul className="text-xs text-slate-400 space-y-1 font-mono">
          <li>• <span className="text-amber-400 font-semibold">bf_* (British Female)</span>: Primary candidate stratum for Faust's composed, analytical cadence</li>
          <li>• <span className="text-amber-400 font-semibold">af_* (American Female)</span>: Alternative clear, modern acoustic profile</li>
          <li>• Recommended Speed: <span className="text-amber-400 font-semibold">0.80x - 0.90x</span> for measured, authoritative delivery</li>
          <li>• Cycle through presets with <span className="text-amber-400 font-semibold">‹ ›</span> buttons for instant A/B evaluation</li>
        </ul>
      </div>
    </div>
  )
}