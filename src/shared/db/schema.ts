import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type {
  UserPreferences,
  QuranProgressRecord,
  ReadingSession,
  Bookmark,
  Favorite,
  LearningProgressRecord,
  DownloadRecord,
  ReminderRecord,
  NotificationSettings,
  TasbihSession,
  QiblaCache,
  AppMeta,
  ArticleProgress,
  PilgrimageProgressRecord,
  PrayerLogRecord,
  PrayerStreakRecord,
} from './types'

const DB_NAME = 'noor-db'
const DB_VERSION = 3

// Singleton stores use this fixed out-of-line key — there's only ever one
// record (preferences, current progress, etc.), keyed uniformly so the
// singleton repo factory in repositories/ can stay generic.
export const SINGLETON_KEY = 'singleton'

interface NoorDB extends DBSchema {
  userPreferences: { key: string; value: UserPreferences }
  quranProgress: { key: string; value: QuranProgressRecord }
  readingSessions: { key: number; value: ReadingSession }
  bookmarks: {
    key: string
    value: Bookmark
    indexes: { byContentType: string; byCreatedAt: number }
  }
  favorites: { key: string; value: Favorite; indexes: { byContentType: string } }
  learningProgress: { key: string; value: LearningProgressRecord; indexes: { byCategory: string } }
  downloads: {
    key: string
    value: DownloadRecord
    indexes: { byContentType: string; byStatus: string }
  }
  reminders: { key: string; value: ReminderRecord; indexes: { byKind: string } }
  notificationSettings: { key: string; value: NotificationSettings }
  tasbihSessions: { key: number; value: TasbihSession }
  qiblaCache: { key: string; value: QiblaCache }
  appMeta: { key: string; value: AppMeta }
  articleProgress: { key: string; value: ArticleProgress }
  pilgrimageProgress: { key: string; value: PilgrimageProgressRecord; indexes: { bySection: string } }
  prayerLog: { key: string; value: PrayerLogRecord; indexes: { byDate: string } }
  prayerStreak: { key: string; value: PrayerStreakRecord }
}

let dbPromise: Promise<IDBPDatabase<NoorDB>> | null = null

// Never destructive: every store creation is guarded so future schema bumps
// (new stores/indexes) can add to this upgrade() without touching existing
// data. IndexedDB persists independently of the service worker's Cache
// Storage, so app updates (§ service worker) never wipe this data.
export function getDB(): Promise<IDBPDatabase<NoorDB>> {
  if (!dbPromise) {
    dbPromise = openDB<NoorDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences')
        }
        if (!db.objectStoreNames.contains('quranProgress')) {
          db.createObjectStore('quranProgress')
        }
        if (!db.objectStoreNames.contains('readingSessions')) {
          db.createObjectStore('readingSessions', { keyPath: 'id', autoIncrement: true })
        }
        if (!db.objectStoreNames.contains('bookmarks')) {
          const store = db.createObjectStore('bookmarks')
          store.createIndex('byContentType', 'contentType')
          store.createIndex('byCreatedAt', 'createdAt')
        }
        if (!db.objectStoreNames.contains('favorites')) {
          const store = db.createObjectStore('favorites')
          store.createIndex('byContentType', 'contentType')
        }
        if (!db.objectStoreNames.contains('learningProgress')) {
          const store = db.createObjectStore('learningProgress')
          store.createIndex('byCategory', 'category')
        }
        if (!db.objectStoreNames.contains('downloads')) {
          const store = db.createObjectStore('downloads')
          store.createIndex('byContentType', 'contentType')
          store.createIndex('byStatus', 'status')
        }
        if (!db.objectStoreNames.contains('reminders')) {
          const store = db.createObjectStore('reminders')
          store.createIndex('byKind', 'kind')
        }
        if (!db.objectStoreNames.contains('notificationSettings')) {
          db.createObjectStore('notificationSettings')
        }
        if (!db.objectStoreNames.contains('tasbihSessions')) {
          db.createObjectStore('tasbihSessions', { keyPath: 'id', autoIncrement: true })
        }
        if (!db.objectStoreNames.contains('qiblaCache')) {
          db.createObjectStore('qiblaCache')
        }
        if (!db.objectStoreNames.contains('appMeta')) {
          db.createObjectStore('appMeta')
        }
        if (!db.objectStoreNames.contains('articleProgress')) {
          db.createObjectStore('articleProgress')
        }
        if (!db.objectStoreNames.contains('pilgrimageProgress')) {
          const store = db.createObjectStore('pilgrimageProgress')
          store.createIndex('bySection', 'section')
        }
        if (!db.objectStoreNames.contains('prayerLog')) {
          const store = db.createObjectStore('prayerLog')
          store.createIndex('byDate', 'dateKey')
        }
        if (!db.objectStoreNames.contains('prayerStreak')) {
          db.createObjectStore('prayerStreak')
        }
      },
    })
  }
  return dbPromise
}

export type { NoorDB }
