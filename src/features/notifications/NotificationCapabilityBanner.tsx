import { BellRing, BellOff, Smartphone } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { useNotificationCapabilities } from './hooks/useNotificationCapabilities'
import './NotificationCapabilityBanner.css'

// Surfaces the live capability tier so reminder toggles are never shown as
// if they'll work when they can't — see lib/capabilities.ts for why iOS
// Safari specifically needs the "limited" tier before install.
export function NotificationCapabilityBanner() {
  const { capabilities, requestPermission } = useNotificationCapabilities()

  if (capabilities.tier === 'full' && capabilities.permission === 'granted') {
    return (
      <GlassCard glow="teal" className="notif-banner notif-banner--ok">
        <BellRing size={18} aria-hidden="true" />
        <span>Prayer notifications are supported and enabled on this device.</span>
      </GlassCard>
    )
  }

  if (capabilities.tier === 'full') {
    return (
      <GlassCard glow="gold" className="notif-banner">
        <BellRing size={18} aria-hidden="true" />
        <div>
          <strong>Prayer notifications supported</strong>
          <p>Allow notifications to enable Adhan and daily reminders below.</p>
        </div>
        <button type="button" onClick={() => void requestPermission()}>
          Allow
        </button>
      </GlassCard>
    )
  }

  if (capabilities.tier === 'limited') {
    return (
      <GlassCard className="notif-banner notif-banner--limited">
        <Smartphone size={18} aria-hidden="true" />
        <div>
          <strong>Install Noor to enable notifications</strong>
          <p>On iPhone/iPad, Safari only allows notifications after Noor is added to your Home Screen.</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="notif-banner notif-banner--limited">
      <BellOff size={18} aria-hidden="true" />
      <span>Notifications are not supported on this device or browser.</span>
    </GlassCard>
  )
}
