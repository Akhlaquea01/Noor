import { describe, it, expect } from 'vitest'
import { toGlobalAyahId, findCurrentJuz, computeNewlyCoveredJuz } from './quranProgress'
import type { QuranMeta } from '../types'

// A small synthetic 3-surah "Quran" so the arithmetic is easy to verify by
// hand: surah 1 has 7 ayahs (global 1-7), surah 2 has 10 ayahs (global
// 8-17), surah 3 has 5 ayahs (global 18-22). Juz 1 covers global 1-10
// (crossing the surah 1/2 boundary), juz 2 covers the rest (11-22).
const meta: QuranMeta = {
  totalAyahs: 22,
  surahs: [
    { number: 1, nameArabic: 'ا', nameTransliteration: 'S1', nameTranslation: 'One', ayahCount: 7, revelationPlace: 'meccan' },
    { number: 2, nameArabic: 'ب', nameTransliteration: 'S2', nameTranslation: 'Two', ayahCount: 10, revelationPlace: 'medinan' },
    { number: 3, nameArabic: 'ت', nameTransliteration: 'S3', nameTranslation: 'Three', ayahCount: 5, revelationPlace: 'meccan' },
  ],
  juz: [
    { juz: 1, startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 3, startAyahId: 1, endAyahId: 10 },
    { juz: 2, startSurah: 2, startAyah: 4, endSurah: 3, endAyah: 5, startAyahId: 11, endAyahId: 22 },
  ],
}

describe('toGlobalAyahId', () => {
  it('maps the first ayah of the first surah to 1', () => {
    expect(toGlobalAyahId(meta, 1, 1)).toBe(1)
  })

  it('accumulates prior surahs\' ayah counts', () => {
    expect(toGlobalAyahId(meta, 2, 1)).toBe(8)
    expect(toGlobalAyahId(meta, 3, 5)).toBe(22)
  })
})

describe('findCurrentJuz', () => {
  it('finds the juz containing a given global ayah id', () => {
    expect(findCurrentJuz(meta, 5)).toBe(1)
    expect(findCurrentJuz(meta, 10)).toBe(1)
    expect(findCurrentJuz(meta, 11)).toBe(2)
    expect(findCurrentJuz(meta, 22)).toBe(2)
  })
})

describe('computeNewlyCoveredJuz (regression: jumping to a later surah must not credit earlier juz)', () => {
  it('credits juz 1 when a session spans exactly its start-to-end range', () => {
    expect(computeNewlyCoveredJuz(meta, 1, 10)).toEqual([1])
  })

  it('credits both juz when a session spans the whole book from the start', () => {
    expect(computeNewlyCoveredJuz(meta, 1, 22)).toEqual([1, 2])
  })

  it('does NOT credit juz 1 or 2 when the reader jumps straight to surah 3 alone', () => {
    // This is the exact bug found during manual testing: opening Surah 3
    // (Al-Ikhlas-equivalent here) directly, without reading anything
    // before it, must not mark earlier juz as completed just because its
    // position is numerically past them.
    const globalStart = toGlobalAyahId(meta, 3, 1)
    const globalEnd = toGlobalAyahId(meta, 3, 5)
    expect(computeNewlyCoveredJuz(meta, globalStart, globalEnd)).toEqual([])
  })

  it('does not credit a juz that is only partially covered', () => {
    // Session covers global 1-9, one ayah short of juz 1's end (10).
    expect(computeNewlyCoveredJuz(meta, 1, 9)).toEqual([])
  })
})
