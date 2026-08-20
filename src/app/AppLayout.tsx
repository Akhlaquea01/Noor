import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  Home,
  BookOpen,
  HandHeart,
  Clock,
  Settings,
  Droplets,
  PersonStanding,
  Compass,
  CircleDot,
  CalendarDays,
  Newspaper,
  Download,
  Bookmark,
} from 'lucide-react'
import { OfflineIndicator } from '../shared/ui/OfflineIndicator'
import { UpdateBanner } from './UpdateBanner'
import { InstallPrompt } from './InstallPrompt'
import './AppLayout.css'

// Mobile bottom nav stays capped at 5 items (screen space); everything else
// lives in the Home quick-access grid. The desktop sidebar has room to list
// every section directly — this is also where the "calendar" fix lives:
// the Hijri calendar page existed but had no menu entry point anywhere in
// the app before this list.
const TABS = [
  { to: '/', label: 'Home', Icon: Home, end: true },
  { to: '/quran', label: 'Quran', Icon: BookOpen },
  { to: '/duas', label: 'Duas', Icon: HandHeart },
  { to: '/prayer-times', label: 'Prayer', Icon: Clock },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

const SIDEBAR_SECTIONS = [
  { to: '/', label: 'Home', Icon: Home, end: true },
  { to: '/quran', label: 'Quran', Icon: BookOpen },
  { to: '/duas', label: 'Duas', Icon: HandHeart },
  { to: '/wudu', label: 'Wudu', Icon: Droplets },
  { to: '/salah', label: 'Salah', Icon: PersonStanding },
  { to: '/prayer-times', label: 'Prayer times', Icon: Clock },
  { to: '/qibla', label: 'Qibla', Icon: Compass },
  { to: '/tasbih', label: 'Tasbih', Icon: CircleDot },
  { to: '/calendar', label: 'Calendar', Icon: CalendarDays },
  { to: '/blogs', label: 'Blogs & Stories', Icon: Newspaper },
  { to: '/downloads', label: 'Offline Library', Icon: Download },
  { to: '/bookmarks', label: 'Bookmarks & Favorites', Icon: Bookmark },
]

export function AppLayout() {
  return (
    <div className="app-layout">
      <a className="app-layout__skip-link" href="#main-content">
        Skip to content
      </a>

      <aside className="app-layout__sidebar">
        <Link to="/" className="app-layout__brand-mark" viewTransition>
          <span className="app-layout__brand-glyph">ن</span>
          <span>
            <strong>Noor</strong>
            <small>your daily light</small>
          </span>
        </Link>

        <nav className="app-layout__sidebar-nav" aria-label="Primary">
          {SIDEBAR_SECTIONS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              viewTransition
              className={({ isActive }) => `app-layout__sidebar-item${isActive ? ' app-layout__sidebar-item--active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-layout__sidebar-bottom">
          <NavLink
            to="/settings"
            viewTransition
            className={({ isActive }) => `app-layout__sidebar-item${isActive ? ' app-layout__sidebar-item--active' : ''}`}
          >
            <Settings size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>Settings</span>
          </NavLink>
          <div className="app-layout__sync-row">
            <OfflineIndicator />
          </div>
        </div>
      </aside>

      <div className="app-layout__body">
        <header className="app-layout__header">
          <Link to="/" className="app-layout__mobile-brand" viewTransition>
            <span>ن</span>
            <strong>Noor</strong>
          </Link>
          <div className="app-layout__header-actions">
            <OfflineIndicator />
          </div>
        </header>

        <UpdateBanner />
        <InstallPrompt />

        <main id="main-content" className="app-layout__main">
          <Outlet />
        </main>

        <nav className="app-layout__tabbar" aria-label="Primary">
          {TABS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              viewTransition
              className={({ isActive }) => `app-layout__tab${isActive ? ' app-layout__tab--active' : ''}`}
            >
              <Icon aria-hidden="true" size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
