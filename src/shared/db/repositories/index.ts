import { createSingletonRepo } from './singletonRepo'
import { createKeyedRepo } from './keyedRepo'
import { createAutoRepo } from './autoRepo'
import {
  DEFAULT_USER_PREFERENCES,
  DEFAULT_QURAN_PROGRESS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_QIBLA_CACHE,
  DEFAULT_PRAYER_STREAK,
} from '../types'

export const userPreferencesRepo = createSingletonRepo('userPreferences', DEFAULT_USER_PREFERENCES)
export const quranProgressRepo = createSingletonRepo('quranProgress', DEFAULT_QURAN_PROGRESS)
export const notificationSettingsRepo = createSingletonRepo('notificationSettings', DEFAULT_NOTIFICATION_SETTINGS)
export const qiblaCacheRepo = createSingletonRepo('qiblaCache', DEFAULT_QIBLA_CACHE)
export const prayerStreakRepo = createSingletonRepo('prayerStreak', DEFAULT_PRAYER_STREAK)
// appMeta has no single sensible default (installId must be generated once)
// so it's initialized explicitly via appMetaRepo.ensureInitialized() below
// rather than through the generic singleton defaults path.
export const appMetaRepoBase = createSingletonRepo('appMeta', {
  schemaVersion: 1,
  contentVersion: '0',
  installId: '',
})

export const bookmarksRepo = createKeyedRepo('bookmarks')
export const favoritesRepo = createKeyedRepo('favorites')
export const learningProgressRepo = createKeyedRepo('learningProgress')
export const downloadsRepo = createKeyedRepo('downloads')
export const remindersRepo = createKeyedRepo('reminders')
export const articleProgressRepo = createKeyedRepo('articleProgress')
export const pilgrimageProgressRepo = createKeyedRepo('pilgrimageProgress')
export const prayerLogRepo = createKeyedRepo('prayerLog')

export const readingSessionsRepo = createAutoRepo('readingSessions')
export const tasbihSessionsRepo = createAutoRepo('tasbihSessions')

export const appMetaRepo = {
  ...appMetaRepoBase,
  async ensureInitialized() {
    const current = await appMetaRepoBase.get()
    if (current.installId) return current
    const initialized = { ...current, installId: crypto.randomUUID() }
    await appMetaRepoBase.set(initialized)
    return initialized
  },
}
