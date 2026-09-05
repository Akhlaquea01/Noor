import { getDB } from './schema'

const BACKUP_APP_ID = 'noor'
const BACKUP_VERSION = 1

// Excluded as per-device (not per-user) state that a cross-device restore
// shouldn't transplant:
// - downloads: the audio bytes live in Cache Storage, not IndexedDB — the
//   record alone would restore as "complete" for audio never re-downloaded.
// - appMeta: installId is generated once per install (see
//   appMetaRepo.ensureInitialized) to identify *this* device; restoring it
//   would leave the destination device answering to the source device's id.
// - qiblaCache: lastLocation is a GPS fallback for this device's last fix
//   (see locationStore.ts) — restoring another device's coordinates could
//   surface a stale, wrong-city qibla direction until the next GPS fix.
// Everything else (preferences, progress, streaks, bookmarks, favorites,
// logs) round-trips exactly as stored.
const EXCLUDED_STORES = ['downloads', 'appMeta', 'qiblaCache']

interface StoreDump {
  key: IDBValidKey
  value: unknown
}

export interface NoorBackup {
  app: typeof BACKUP_APP_ID
  backupVersion: number
  exportedAt: number
  stores: Record<string, StoreDump[]>
}

export async function exportBackup(): Promise<NoorBackup> {
  const db = await getDB()
  const names = Array.from(db.objectStoreNames).filter((n) => !EXCLUDED_STORES.includes(n))
  const stores: Record<string, StoreDump[]> = {}

  // One shared transaction across every store: a plain per-store loop with
  // awaits between stores would still be correct, but this keeps the export
  // a single consistent snapshot rather than one that could straddle a
  // concurrent write (e.g. the notification scheduler touching `reminders`
  // mid-export). A single cursor pass per store (rather than getAllKeys()
  // and getAll() as two separate full-store reads) keeps this to one pass
  // over stores like readingSessions/tasbihSessions that only ever grow.
  const tx = db.transaction(names, 'readonly')
  await Promise.all(
    names.map(async (name) => {
      const store = tx.objectStore(name)
      const dump: StoreDump[] = []
      for await (const cursor of store.iterate()) {
        dump.push({ key: cursor.key, value: cursor.value })
      }
      stores[name] = dump
    })
  )
  await tx.done

  return { app: BACKUP_APP_ID, backupVersion: BACKUP_VERSION, exportedAt: Date.now(), stores }
}

export function isNoorBackup(data: unknown): data is NoorBackup {
  if (!data || typeof data !== 'object') return false
  const candidate = data as Partial<NoorBackup>
  return (
    candidate.app === BACKUP_APP_ID &&
    typeof candidate.stores === 'object' &&
    candidate.stores !== null &&
    !Array.isArray(candidate.stores)
  )
}

// Destructive by design: each included store is cleared before the backup's
// records are written back, so a restore fully replaces current state
// rather than merging with it (merging two independent histories of, say,
// prayer logs or streaks has no sensible resolution). All stores are
// restored in one transaction so a mid-restore failure can't leave the app
// with some stores swapped and others not.
export async function restoreBackup(backup: NoorBackup): Promise<void> {
  if (!isNoorBackup(backup)) {
    throw new Error('This file is not a Noor backup.')
  }

  const db = await getDB()
  const names = Array.from(db.objectStoreNames).filter((n) => n in backup.stores)
  const tx = db.transaction(names, 'readwrite')
  await Promise.all(
    names.map(async (name) => {
      const store = tx.objectStore(name)
      // Restoring crosses the typed schema dynamically (any store, any
      // shape from the backup file) — put() is cast to accept that instead
      // of narrowing per-store like the rest of the app's typed repos do.
      // Bound (not just cast-and-called via a plain variable) since it's an
      // IDBPObjectStore method that reads internal state off `this`.
      const put = (store.put as unknown as (value: unknown, key?: IDBValidKey) => Promise<IDBValidKey>).bind(store)
      await store.clear()
      for (const { key, value } of backup.stores[name]) {
        // Inline-keyPath stores (readingSessions, tasbihSessions) error if a
        // key is also passed explicitly to put() — the key must come from
        // the value's own id field instead.
        if (store.keyPath) {
          await put(value)
        } else {
          await put(value, key)
        }
      }
    })
  )
  await tx.done
}
