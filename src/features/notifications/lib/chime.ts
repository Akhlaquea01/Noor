// A short, synthesized two-note chime for prayer/daily reminders — not a
// sourced audio file. This is deliberate: a full vocal Adhan recording
// carries real performance/provenance rights (it's a specific muezzin's
// voice), and no verifiably-licensed one could be found (see the decision
// recorded in SettingsNotificationsPage). A synthesized tone has zero
// licensing surface at all, since nothing is "content" — it's generated in
// code. Adding a real Adhan voice later remains open, pending a properly
// licensed source.
let audioContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioContext) audioContext = new Ctor()
  return audioContext
}

function playTone(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(0.22, startTime + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.05)
}

// Two warm, gentle notes (a rising major third) — not attempting to imitate
// a call to prayer, just a pleasant, distinct alert. Fails silently: a
// blocked/unavailable AudioContext (autoplay policy, old browser) should
// never prevent the notification itself from showing.
export async function playChime(): Promise<void> {
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      return
    }
  }
  try {
    const now = ctx.currentTime
    playTone(ctx, 880, now, 0.5)
    playTone(ctx, 1108.73, now + 0.18, 0.6)
  } catch {
    // Best-effort — a synth glitch should never break the notification flow.
  }
}
