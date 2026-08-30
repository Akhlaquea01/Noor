import { useCallback, useEffect, useState } from 'react'
import { pilgrimageProgressRepo } from '../../../shared/db/repositories'
import { createSyncMeta, touchSyncMeta } from '../../../shared/db/syncMeta'
import { pilgrimageProgressKey } from '../lib/pilgrimageProgressKey'
import type { PilgrimageSection } from '../../../shared/db/types'

// Bulk-loads the whole section's done/not-done set in one query (via the
// bySection index) rather than each step card running its own DB read —
// a Hajj guide can have dozens of steps across five days, and the phase
// progress badges need every step's status anyway.
export function usePilgrimageSection(section: PilgrimageSection) {
  const [doneSteps, setDoneSteps] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    void pilgrimageProgressRepo.listByIndex('bySection', section).then((records) => {
      if (cancelled) return
      setDoneSteps(new Set(records.filter((r) => r.done).map((r) => r.stepId)))
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [section])

  const toggle = useCallback(
    async (stepId: string) => {
      const key = pilgrimageProgressKey(section, stepId)
      const existing = await pilgrimageProgressRepo.get(key)
      const nextDone = !(existing?.done ?? false)
      const record = existing
        ? touchSyncMeta({ ...existing, done: nextDone, doneAt: nextDone ? Date.now() : null })
        : { ...createSyncMeta(), section, stepId, done: nextDone, doneAt: nextDone ? Date.now() : null }
      await pilgrimageProgressRepo.put(key, record)
      setDoneSteps((prev) => {
        const next = new Set(prev)
        if (nextDone) next.add(stepId)
        else next.delete(stepId)
        return next
      })
    },
    [section]
  )

  return { doneSteps, toggle, loaded }
}
