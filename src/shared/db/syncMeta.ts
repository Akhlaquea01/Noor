import type { SyncMeta } from './types'

// Stamps a fresh SyncMeta envelope for a new record. `dirty: true` marks it
// as needing a push once Sync Mode exists; Local Mode never reads `dirty`.
export function createSyncMeta(): SyncMeta {
  return {
    localId: crypto.randomUUID(),
    updatedAt: Date.now(),
    dirty: true,
  }
}

export function touchSyncMeta<T extends SyncMeta>(record: T): T {
  return { ...record, updatedAt: Date.now(), dirty: true }
}
