import type { DuaCategory, Dua } from '../types'

// /data/duas/** is precached alongside the rest of the bundled content (see
// vite.config.ts) — works fully offline after first install.
let categoriesPromise: Promise<DuaCategory[]> | null = null

export function getDuaCategories(): Promise<DuaCategory[]> {
  if (!categoriesPromise) {
    categoriesPromise = fetch('/data/duas/categories.json').then((r) => r.json())
  }
  return categoriesPromise
}

export function getDuasByCategory(categoryId: string): Promise<Dua[]> {
  return fetch(`/data/duas/${categoryId}.json`).then((r) => r.json())
}

let allDuasPromise: Promise<Dua[]> | null = null

// Powers the Home dashboard's "verse of the day" — reuses the same verified
// Quran-derived dua content rather than curating a separate list, so there's
// no new citation to get wrong.
export function getAllDuas(): Promise<Dua[]> {
  if (!allDuasPromise) {
    allDuasPromise = getDuaCategories().then((categories) =>
      Promise.all(categories.map((c) => getDuasByCategory(c.id))).then((lists) => lists.flat())
    )
  }
  return allDuasPromise
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export async function getVerseOfTheDay(date: Date = new Date()): Promise<Dua> {
  const duas = await getAllDuas()
  return duas[dayOfYear(date) % duas.length]
}
