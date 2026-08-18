// Every synced-eligible record carries this envelope so a future Sync Mode
// can push/merge changes without restructuring existing stores. Local Mode
// only ever reads/writes localId + updatedAt; the rest stay unused until a
// cloud backend exists.
export interface SyncMeta {
  localId: string
  remoteId?: string
  updatedAt: number
  dirty: boolean
  deleted?: boolean
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  fontScale: number
  highContrast: boolean
  reducedMotion: boolean
  calculationMethod: string
  madhab: 'shafi' | 'hanafi'
  locationMode: 'gps' | 'manual'
  // utcOffsetHours is required for manual mode: without it, prayer times
  // would display in the device's ambient timezone rather than the
  // manually-entered location's — silently wrong whenever they differ (e.g.
  // checking times for family in another country). GPS mode has no such
  // field because a device's own timezone and its GPS location are, in
  // virtually every real case, already consistent.
  manualLocation?: { lat: number; lng: number; city?: string; utcOffsetHours?: number }
  streakEnabled: boolean
  dailyGoal: { type: 'pages' | 'juz'; amount: number }
  distanceUnit: 'km' | 'mi'
  // Controls the Quran reader's audio player: whether downloaded recitation
  // starts playing as soon as a surah with audio opens, and whether it
  // continues into the next surah's audio automatically when one finishes.
  autoplayAudio: boolean
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  fontScale: 1,
  highContrast: false,
  reducedMotion: false,
  calculationMethod: 'MuslimWorldLeague',
  madhab: 'shafi',
  locationMode: 'gps',
  streakEnabled: true,
  dailyGoal: { type: 'pages', amount: 1 },
  distanceUnit: 'km',
  autoplayAudio: false,
}

export interface QuranProgressRecord {
  lastSurah: number | null
  lastAyah: number | null
  lastReadAt: number | null
  completedJuz: number[]
  totalAyahsRead: number
  currentStreakCount: number
  longestStreak: number
  streakLastDate: string | null
}

export const DEFAULT_QURAN_PROGRESS: QuranProgressRecord = {
  lastSurah: null,
  lastAyah: null,
  lastReadAt: null,
  completedJuz: [],
  totalAyahsRead: 0,
  currentStreakCount: 0,
  longestStreak: 0,
  streakLastDate: null,
}

export interface ReadingSession {
  id?: number
  surah: number
  ayahStart: number
  ayahEnd: number
  startedAt: number
  endedAt: number
  durationSec: number
}

export type ContentType = 'ayah' | 'dua' | 'article' | 'story'

export interface Bookmark extends SyncMeta {
  contentType: ContentType
  surah?: number
  ayah?: number
  duaId?: string
  articleId?: string
  note?: string
  createdAt: number
}

export interface Favorite extends SyncMeta {
  contentType: 'ayah' | 'dua' | 'surah' | 'article' | 'story'
  refId: string
  createdAt: number
}

export type LearningCategory = 'wudu' | 'salah' | 'dua'
export type LearningStage = 'not_started' | 'learning' | 'practicing' | 'memorized'

export interface LearningProgressRecord extends SyncMeta {
  category: LearningCategory
  itemId: string
  stage: LearningStage
  stageUpdatedAt: number
  practiceCount: number
}

export type DownloadContentType = 'quran-audio' | 'dhikr-audio'
export type DownloadStatus = 'queued' | 'downloading' | 'complete' | 'error' | 'stale'

export interface DownloadRecord extends SyncMeta {
  contentType: DownloadContentType
  scope: 'surah' | 'juz' | 'full' | 'category'
  scopeId: string
  reciterId?: string
  sizeBytes: number
  status: DownloadStatus
  progressPct: number
  cacheStorageKey: string
  downloadedAt: number | null
  version: string
}

export type ReminderKind = 'prayer' | 'daily'
export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
export type DailyReminderCategory = 'morning' | 'afternoon' | 'evening' | 'night'

export interface ReminderRecord extends SyncMeta {
  kind: ReminderKind
  prayerName?: PrayerName
  dailyCategory?: DailyReminderCategory
  enabled: boolean
  offsetMinutes: number
  lastFiredAt: number | null
}

export interface NotificationSettings {
  permissionStatusCache: NotificationPermission | 'unsupported'
  capabilitySnapshot: unknown | null
  masterEnabled: boolean
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  permissionStatusCache: 'default',
  capabilitySnapshot: null,
  masterEnabled: true,
}

export interface TasbihSession {
  id?: number
  dhikrText: string
  targetCount: number
  count: number
  startedAt: number
  endedAt: number | null
  completed: boolean
}

export interface QiblaCache {
  lastComputedBearing: number | null
  lastLocation: { lat: number; lng: number } | null
  computedAt: number | null
}

export const DEFAULT_QIBLA_CACHE: QiblaCache = {
  lastComputedBearing: null,
  lastLocation: null,
  computedAt: null,
}

export interface AppMeta {
  schemaVersion: number
  contentVersion: string
  installId: string
}

export interface ArticleProgress {
  articleId: string
  lastReadAt: number
  readComplete: boolean
}
