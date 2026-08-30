import { Link } from 'react-router-dom'
import { Plane, Landmark, Mountain, ChevronRight } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import './HajjUmrahHubPage.css'

const SECTIONS = [
  {
    to: '/hajj-umrah/prepare',
    label: 'Before You Travel',
    detail: 'Pre-departure duas, and visiting Madina — not part of the rites, but highly recommended',
    Icon: Plane,
  },
  {
    to: '/hajj-umrah/umrah',
    label: 'Umrah',
    detail: 'Miqat, Ihram, Tawaf, Sa’ee, and Halq — step by step',
    Icon: Landmark,
  },
  {
    to: '/hajj-umrah/hajj',
    label: 'Hajj',
    detail: 'The 5-day schedule, from Mina to Muzdalifah, Arafat, and the Jamarat',
    Icon: Mountain,
  },
]

export function HajjUmrahHubPage() {
  return (
    <section className="hajj-umrah-hub-page">
      <h1>Hajj &amp; Umrah</h1>
      <p className="hajj-umrah-hub-page__note">
        Interactive, step-by-step guides you can follow along with during the journey itself — tap a step to mark
        it done, and your progress is saved on this device.
      </p>

      <ul className="hajj-umrah-hub-page__list">
        {SECTIONS.map(({ to, label, detail, Icon }) => (
          <li key={to}>
            <GlassCard as={Link} to={to} viewTransition interactive className="hajj-umrah-hub-page__row">
              <span className="hajj-umrah-hub-page__icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div>
                <strong>{label}</strong>
                <p>{detail}</p>
              </div>
              <ChevronRight size={18} aria-hidden="true" className="hajj-umrah-hub-page__arrow" />
            </GlassCard>
          </li>
        ))}
      </ul>

      <p className="hajj-umrah-hub-page__disclaimer">
        These guides follow the Hanafi madhhab as commonly taught in the South Asian tradition. Rites, obligatory
        acts, and permitted variations differ across madhhabs and by Hajj type (Tamattu&apos;, Qiran, Ifrad) — follow
        the guidance of your Hajj group leader or a qualified scholar for anything specific to your situation.
      </p>
    </section>
  )
}
