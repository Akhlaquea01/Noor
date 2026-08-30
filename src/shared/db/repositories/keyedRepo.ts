import { getDB } from '../schema'
import type { NoorDB } from '../schema'

type KeyedStoreName =
  | 'bookmarks'
  | 'favorites'
  | 'learningProgress'
  | 'downloads'
  | 'reminders'
  | 'articleProgress'
  | 'pilgrimageProgress'

// Factory for out-of-line keyed collection stores where the caller derives
// the key itself (uuid for bookmarks/favorites/downloads/reminders, a
// composite "${category}:${itemId}" for learningProgress, articleId for
// articleProgress).
export function createKeyedRepo<K extends KeyedStoreName>(storeName: K) {
  type Value = NoorDB[K]['value']

  return {
    async get(key: string): Promise<Value | undefined> {
      const db = await getDB()
      return db.get(storeName, key)
    },
    async put(key: string, value: Value): Promise<void> {
      const db = await getDB()
      await db.put(storeName, value, key)
    },
    async remove(key: string): Promise<void> {
      const db = await getDB()
      await db.delete(storeName, key)
    },
    async list(): Promise<Value[]> {
      const db = await getDB()
      return db.getAll(storeName)
    },
    // Index name is loosely typed (string) rather than idb's strict
    // IndexNames<...> generic — the strict version doesn't narrow cleanly
    // per-store through this shared factory, and every call site is
    // internal, so the small loss of compile-time index-name checking is a
    // reasonable tradeoff for a much simpler factory signature.
    async listByIndex(indexName: string, value: string): Promise<Value[]> {
      const db = await getDB()
      // idb's getAllFromIndex generics don't narrow cleanly through this
      // shared factory (see note above) — cast at the call boundary only.
      const getAllFromIndex = db.getAllFromIndex.bind(db) as (
        store: K,
        index: string,
        query: string
      ) => Promise<Value[]>
      return getAllFromIndex(storeName, indexName, value)
    },
  }
}
