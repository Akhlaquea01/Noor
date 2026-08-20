import { Compass } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { useLocation } from '../../shared/hooks/useLocation'
import { useDeviceHeading } from './hooks/useDeviceHeading'
import { calculateQiblaBearing } from './lib/calculateQiblaBearing'
import './QiblaPage.css'

export function QiblaPage() {
  const { location, source, loading, error } = useLocation()
  const { heading, needsPermissionRequest, requestPermission, permission, timedOut } = useDeviceHeading()

  const bearing = location ? calculateQiblaBearing(location) : null
  const needleRotation = bearing !== null ? (heading !== null ? bearing - heading : bearing) : 0

  return (
    <section className="qibla-page">
      <h1>Qibla</h1>

      {loading && <p className="qibla-page__status">Getting location…</p>}
      {error && !location && <GlassCard className="qibla-page__error">{error}</GlassCard>}

      {location && bearing !== null && (
        <>
          <div className="qibla-page__compass">
            <svg viewBox="0 0 200 200" className="qibla-page__dial" role="img" aria-label={`Qibla is ${Math.round(bearing)} degrees from North`}>
              <circle cx="100" cy="100" r="96" className="qibla-page__ring" />
              <text x="100" y="20" className="qibla-page__cardinal">N</text>
              <text x="180" y="105" className="qibla-page__cardinal">E</text>
              <text x="100" y="190" className="qibla-page__cardinal">S</text>
              <text x="20" y="105" className="qibla-page__cardinal">W</text>
              <g transform={`rotate(${needleRotation} 100 100)`}>
                <polygon points="100,20 108,100 100,130 92,100" className="qibla-page__needle" />
                <Compass x="84" y="6" width="32" height="32" className="qibla-page__needle-icon" />
              </g>
            </svg>
          </div>

          <p className="qibla-page__bearing">{Math.round(bearing)}° from North</p>

          {needsPermissionRequest && (
            <button type="button" className="qibla-page__enable" onClick={() => void requestPermission()}>
              Enable compass
            </button>
          )}
          {!needsPermissionRequest && heading === null && (
            <p className="qibla-page__note">
              {permission === 'unsupported' || permission === 'denied' || timedOut
                ? 'Live compass is not available on this device — the bearing above is measured from true North.'
                : 'Move your device to calibrate the compass.'}
            </p>
          )}
          {source === 'cached' && <p className="qibla-page__note">Using your last known location (offline).</p>}
        </>
      )}
    </section>
  )
}
