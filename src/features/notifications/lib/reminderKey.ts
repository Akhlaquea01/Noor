import type { ReminderKind } from '../../../shared/db/types'

export function reminderKey(kind: ReminderKind, sub: string): string {
  return `${kind}:${sub}`
}
