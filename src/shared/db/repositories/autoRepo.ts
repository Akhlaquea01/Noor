import { getDB } from '../schema'
import type { NoorDB } from '../schema'

type AutoStoreName = 'readingSessions' | 'tasbihSessions'

// Factory for in-line keyPath + autoIncrement collection stores (session
// logs where the DB itself assigns the id).
export function createAutoRepo<K extends AutoStoreName>(storeName: K) {
  type Value = NoorDB[K]['value']

  return {
    async add(value: Value): Promise<number> {
      const db = await getDB()
      return db.add(storeName, value) as Promise<number>
    },
    async list(): Promise<Value[]> {
      const db = await getDB()
      return db.getAll(storeName)
    },
    async remove(id: number): Promise<void> {
      const db = await getDB()
      await db.delete(storeName, id)
    },
  }
}
