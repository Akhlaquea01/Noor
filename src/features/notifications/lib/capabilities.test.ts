import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { detectCapabilities } from './capabilities'

function stubUserAgent(ua: string) {
  Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true })
}

function stubStandalone(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('standalone') ? matches : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

// jsdom implements neither `Notification` nor `navigator.serviceWorker` by
// default — capabilities.ts treats their absence as unsupported regardless
// of everything else, so every test needs an explicit baseline of "these
// exist" before it can meaningfully vary platform/install state.
function stubServiceWorker(present: boolean) {
  if (present) {
    Object.defineProperty(window.navigator, 'serviceWorker', { value: {}, configurable: true })
  } else {
    // @ts-expect-error simulating a browser with no SW support
    delete window.navigator.serviceWorker
  }
}

function stubNotification(present: boolean) {
  if (present) {
    vi.stubGlobal('Notification', { permission: 'default' })
  } else {
    vi.stubGlobal('Notification', undefined)
  }
}

const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0'

describe('detectCapabilities', () => {
  beforeEach(() => {
    stubNotification(true)
    stubServiceWorker(true)
    stubStandalone(false)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reports "limited" on iOS Safari when not installed as a standalone PWA', () => {
    stubUserAgent(IOS_UA)
    const caps = detectCapabilities()
    expect(caps.platformHint).toBe('ios-safari')
    expect(caps.tier).toBe('limited')
  })

  it('reports "full" on iOS Safari once installed as a standalone PWA', () => {
    stubUserAgent(IOS_UA)
    stubStandalone(true)
    const caps = detectCapabilities()
    expect(caps.tier).toBe('full')
  })

  it('reports "full" on Android Chrome regardless of install state', () => {
    stubUserAgent(ANDROID_UA)
    const caps = detectCapabilities()
    expect(caps.platformHint).toBe('android-chrome')
    expect(caps.tier).toBe('full')
  })

  it('reports "unsupported" when the service worker API does not exist, even with Notification present', () => {
    stubUserAgent(ANDROID_UA)
    stubServiceWorker(false)
    const caps = detectCapabilities()
    expect(caps.serviceWorkerSupported).toBe(false)
    expect(caps.tier).toBe('unsupported')
  })

  it('reports "unsupported" when the Notification API does not exist', () => {
    stubUserAgent(ANDROID_UA)
    stubNotification(false)
    const caps = detectCapabilities()
    expect(caps.notificationApiSupported).toBe(false)
    expect(caps.tier).toBe('unsupported')
    expect(caps.permission).toBe('unsupported')
  })
})
