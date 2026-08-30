import { getDB, SINGLETON_KEY } from '../schema'
import type { NoorDB } from '../schema'

type SingletonStoreName =
  | 'userPreferences'
  | 'quranProgress'
  | 'notificationSettings'
  | 'qiblaCache'
  | 'appMeta'
  | 'prayerStreak'

// Factory for the stores that only ever hold one record (settings,
// current progress snapshot, etc). All feature code goes through repos like
// this rather than importing `idb` directly — the seam where a future Sync
// Mode inserts a queue-and-push step without touching feature code.
export function createSingletonRepo<K extends SingletonStoreName>(storeName: K, defaults: NoorDB[K]['value']) {
  return {
    async get(): Promise<NoorDB[K]['value']> {
      const db = await getDB()
      const existing = await db.get(storeName, SINGLETON_KEY)
      if (!existing) return defaults
      // Backfills any field added to `defaults` after this record was first
      // written — e.g. a preference shipped in a later update — without
      // touching the user's actual saved values. `...existing` spreads
      // after `...defaults`, so every field the user actually has wins;
      // only genuinely-missing keys fall back to the new default. Without
      // this, a new boolean preference defaulting to `true` would silently
      // read as `undefined` (falsy) for anyone who already had a
      // preferences record, quietly defeating the intended default.
      return { ...defaults, ...existing }
    },
    async set(value: NoorDB[K]['value']): Promise<void> {
      const db = await getDB()
      await db.put(storeName, value, SINGLETON_KEY)
    },
    async update(patch: Partial<NoorDB[K]['value']>): Promise<NoorDB[K]['value']> {
      const db = await getDB()
      const existing = await db.get(storeName, SINGLETON_KEY)
      const current = existing ? { ...defaults, ...existing } : defaults
      const next = { ...current, ...patch }
      await db.put(storeName, next, SINGLETON_KEY)
      return next
    },
  }
}
