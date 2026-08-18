import { useEffect, useState } from 'react'
import { learningProgressRepo } from '../../../shared/db/repositories'
import { createSyncMeta, touchSyncMeta } from '../../../shared/db/syncMeta'
import { learningProgressKey } from '../lib/learningProgressKey'
import type { LearningCategory, LearningStage } from '../../../shared/db/types'

// Shared by Duas (M4) and Wudu/Salah (M5) — same not_started -> learning ->
// practicing -> memorized progression backed by the single learningProgress
// store, keyed "${category}:${itemId}".
export function useLearningStage(category: LearningCategory, itemId: string) {
  const key = learningProgressKey(category, itemId)
  const [stage, setStageState] = useState<LearningStage>('not_started')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    void learningProgressRepo.get(key).then((record) => {
      if (cancelled) return
      setStageState(record?.stage ?? 'not_started')
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [key])

  const setStage = async (next: LearningStage) => {
    const existing = await learningProgressRepo.get(key)
    const record = existing
      ? touchSyncMeta({ ...existing, stage: next, stageUpdatedAt: Date.now() })
      : {
          ...createSyncMeta(),
          category,
          itemId,
          stage: next,
          stageUpdatedAt: Date.now(),
          practiceCount: 0,
        }
    await learningProgressRepo.put(key, record)
    setStageState(next)
  }

  return { stage, setStage, loaded }
}
