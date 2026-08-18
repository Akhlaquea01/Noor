import { getDB, SINGLETON_KEY } from '../schema'
import type { NoorDB } from '../schema'

type SingletonStoreName = 'userPreferences' | 'quranProgress' | 'notificationSettings' | 'qiblaCache' | 'appMeta'

// Factory for the five stores that only ever hold one record (settings,
// current progress snapshot, etc). All feature code goes through repos like
// this rather than importing `idb` directly — the seam where a future Sync
// Mode inserts a queue-and-push step without touching feature code.
export function createSingletonRepo<K extends SingletonStoreName>(storeName: K, defaults: NoorDB[K]['value']) {
  return {
    async get(): Promise<NoorDB[K]['value']> {
      const db = await getDB()
      const existing = await db.get(storeName, SINGLETON_KEY)
      return existing ?? defaults
    },
    async set(value: NoorDB[K]['value']): Promise<void> {
      const db = await getDB()
      await db.put(storeName, value, SINGLETON_KEY)
    },
    async update(patch: Partial<NoorDB[K]['value']>): Promise<NoorDB[K]['value']> {
      const db = await getDB()
      const current = (await db.get(storeName, SINGLETON_KEY)) ?? defaults
      const next = { ...current, ...patch }
      await db.put(storeName, next, SINGLETON_KEY)
      return next
    },
  }
}
