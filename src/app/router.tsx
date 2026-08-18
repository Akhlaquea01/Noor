import { createHashRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { SettingsPage } from './SettingsPage'
import { SettingsAccessibilityPage } from './SettingsAccessibilityPage'
import { HomePage } from '../features/home-dashboard/HomePage'
import { QuranListPage } from '../features/quran/QuranListPage'
import { QuranReaderPage } from '../features/quran/QuranReaderPage'
import { DuaCategoriesPage } from '../features/duas/DuaCategoriesPage'
import { DuaListPage } from '../features/duas/DuaListPage'
import { WuduPage } from '../features/wudu/WuduPage'
import { SalahPage } from '../features/salah/SalahPage'
import { PrayerTimesPage } from '../features/prayer-times/PrayerTimesPage'
import { QiblaPage } from '../features/qibla/QiblaPage'
import { TasbihPage } from '../features/tasbih/TasbihPage'
import { HijriCalendarPage } from '../features/hijri-calendar/HijriCalendarPage'
import { BlogsListPage } from '../features/articles/BlogsListPage'
import { BlogArticlePage } from '../features/articles/BlogArticlePage'
import { StoriesListPage } from '../features/articles/StoriesListPage'
import { StoryPage } from '../features/articles/StoryPage'
import { DownloadsPage } from '../features/downloads/DownloadsPage'
import { SettingsNotificationsPage } from '../features/notifications/SettingsNotificationsPage'
import { SettingsStoragePage } from '../features/storage/SettingsStoragePage'
import { BookmarksPage } from '../features/bookmarks-favorites/BookmarksPage'

// Hash-based routing (not history/browser routing): with no backend, Noor is
// deployed as static files with no guarantee of a server-side rewrite rule
// for deep links (e.g. GitHub Pages, S3, or any host without a SPA fallback
// config). Hash routes never hit the network for their path segment, so a
// hard reload/deep-link on /#/quran/2 only ever requests "/" — which is
// always in the Workbox precache — both on first load online and offline.
export const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/quran', element: <QuranListPage /> },
      { path: '/quran/:surahId', element: <QuranReaderPage /> },
      { path: '/duas', element: <DuaCategoriesPage /> },
      { path: '/duas/:categoryId', element: <DuaListPage /> },
      { path: '/wudu', element: <WuduPage /> },
      { path: '/salah', element: <SalahPage /> },
      { path: '/prayer-times', element: <PrayerTimesPage /> },
      { path: '/qibla', element: <QiblaPage /> },
      { path: '/tasbih', element: <TasbihPage /> },
      { path: '/calendar', element: <HijriCalendarPage /> },
      { path: '/blogs', element: <BlogsListPage /> },
      { path: '/blogs/:articleId', element: <BlogArticlePage /> },
      { path: '/stories', element: <StoriesListPage /> },
      { path: '/stories/:storyId', element: <StoryPage /> },
      { path: '/downloads', element: <DownloadsPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/settings/notifications', element: <SettingsNotificationsPage /> },
      { path: '/settings/storage', element: <SettingsStoragePage /> },
      { path: '/settings/accessibility', element: <SettingsAccessibilityPage /> },
      { path: '/bookmarks', element: <BookmarksPage /> },
    ],
  },
])
