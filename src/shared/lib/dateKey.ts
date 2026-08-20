// Local calendar day, not UTC. `date.toISOString().slice(0, 10)` gives the
// UTC date, which rolls over at the wrong moment for anyone not near UTC —
// e.g. at 5:30pm local time in India, 7-8pm in the US — silently breaking
// any "same day" / "yesterday" comparison built on it (missed/duplicated
// daily reminders, a reading streak that resets despite reading every real
// calendar day). Used wherever "today" needs to match the user's own day.
export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
