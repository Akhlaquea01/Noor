import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotificationCapabilitiesStore } from './notificationCapabilitiesStore'
import { useNotificationCapabilities } from '../hooks/useNotificationCapabilities'
import { detectCapabilities } from '../lib/capabilities'

// Regression test for the actual "notification checkboxes don't work" bug:
// NotificationCapabilityBanner and SettingsNotificationsPage each called
// useNotificationCapabilities() independently. Before this fix, that hook
// held its own local useState, so granting permission in the banner never
// reached the settings page's copy — checkboxes stayed disabled until a
// full remount. The fix moved the state into a shared store; this test
// renders two independent hook instances (mirroring the two real
// components) and asserts a permission change in one is visible in both.
describe('notification capabilities are shared across independent consumers', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'serviceWorker', { value: {}, configurable: true })
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    const notificationMock = {
      permission: 'default' as NotificationPermission,
      requestPermission: vi.fn(async () => {
        notificationMock.permission = 'granted'
        return 'granted' as NotificationPermission
      }),
    }
    vi.stubGlobal('Notification', notificationMock)
    // The store is a module-level singleton (by design — that's the fix),
    // so its state persists across tests unless reset here to match each
    // test's freshly-stubbed globals.
    useNotificationCapabilitiesStore.setState({ capabilities: detectCapabilities() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    // @ts-expect-error test cleanup
    delete window.navigator.serviceWorker
  })

  it('updates every consumer, not just the one that requested permission', async () => {
    const banner = renderHook(() => useNotificationCapabilities())
    const settingsPage = renderHook(() => useNotificationCapabilities())

    expect(banner.result.current.capabilities.permission).toBe('default')
    expect(settingsPage.result.current.capabilities.permission).toBe('default')

    // Simulates the user clicking "Allow" inside the banner only.
    await act(async () => {
      await banner.result.current.requestPermission()
    })

    expect(banner.result.current.capabilities.permission).toBe('granted')
    // This is the exact assertion that would have failed before the fix —
    // the settings page's independent hook instance now sees the change too.
    expect(settingsPage.result.current.capabilities.permission).toBe('granted')
  })

  it('reading the store directly reflects the same state both hooks see', async () => {
    const hook = renderHook(() => useNotificationCapabilities())
    await act(async () => {
      await hook.result.current.requestPermission()
    })
    expect(useNotificationCapabilitiesStore.getState().capabilities.permission).toBe('granted')
  })
})
