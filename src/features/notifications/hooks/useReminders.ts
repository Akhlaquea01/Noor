import { useEffect, useState } from 'react'
import { remindersRepo } from '../../../shared/db/repositories'
import { createSyncMeta, touchSyncMeta } from '../../../shared/db/syncMeta'
import { reminderKey } from '../lib/reminderKey'
import type { ReminderRecord, ReminderKind, PrayerName, DailyReminderCategory } from '../../../shared/db/types'

export function useReminders() {
  const [reminders, setReminders] = useState<Map<string, ReminderRecord>>(new Map())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    void remindersRepo.list().then((list) => {
      setReminders(new Map(list.map((r) => [reminderKey(r.kind, r.prayerName ?? r.dailyCategory ?? ''), r])))
      setLoaded(true)
    })
  }, [])

  const upsert = async (
    kind: ReminderKind,
    sub: PrayerName | DailyReminderCategory,
    patch: Partial<Pick<ReminderRecord, 'enabled' | 'offsetMinutes'>>
  ) => {
    const key = reminderKey(kind, sub)
    const existing = reminders.get(key)
    const next: ReminderRecord = existing
      ? touchSyncMeta({ ...existing, ...patch })
      : {
          ...createSyncMeta(),
          kind,
          prayerName: kind === 'prayer' ? (sub as PrayerName) : undefined,
          dailyCategory: kind === 'daily' ? (sub as DailyReminderCategory) : undefined,
          enabled: true,
          offsetMinutes: 0,
          lastFiredAt: null,
          ...patch,
        }
    await remindersRepo.put(key, next)
    setReminders((prev) => new Map(prev).set(key, next))
  }

  const get = (kind: ReminderKind, sub: PrayerName | DailyReminderCategory): ReminderRecord | undefined =>
    reminders.get(reminderKey(kind, sub))

  return { reminders, get, upsert, loaded }
}
