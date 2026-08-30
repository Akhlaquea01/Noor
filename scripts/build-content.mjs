// Transforms raw Quran source data (from the `quran-json` and `quran-meta`
// npm packages, used only at build time — see package.json devDependencies)
// into the per-surah JSON files Noor bundles and precaches for offline use.
//
// Sources & licenses (attribution required, surfaced in Settings > About):
// - Arabic (Uthmani) text, English transliteration, and the Saheeh
//   International English translation: `quran-json` by Risan Bagja Pradana,
//   CC-BY-SA 4.0 (https://github.com/risan/quran-json). Originally sourced
//   from The Noble Qur'an Encyclopedia and Tanzil.net.
// - Juz boundary metadata: `quran-meta` (MIT), computed from the standard
//   Hafs riwaya ayah numbering.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHafs } from 'quran-meta'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const quranJsonDist = path.join(root, 'node_modules/quran-json/dist')
const outDir = path.join(root, 'public/data/quran')

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function pad3(n) {
  return String(n).padStart(3, '0')
}

const chaptersIndex = JSON.parse(readFileSync(path.join(quranJsonDist, 'chapters/index.json'), 'utf-8'))
const hafs = createHafs()

ensureDir(path.join(outDir, 'arabic'))
ensureDir(path.join(outDir, 'translation-en'))
ensureDir(path.join(outDir, 'transliteration'))

const surahMeta = []
const versesBySurah = new Map()
const hasher = createHash('sha256')

for (const chapter of chaptersIndex) {
  const num = chapter.id
  const full = JSON.parse(readFileSync(path.join(quranJsonDist, `chapters/en/${num}.json`), 'utf-8'))
  versesBySurah.set(num, full.verses)

  const arabic = full.verses.map((v) => ({ ayah: v.id, text: v.text }))
  const translation = full.verses.map((v) => ({ ayah: v.id, translation: v.translation }))
  const transliteration = full.verses.map((v) => ({ ayah: v.id, transliteration: v.transliteration }))

  const arabicJson = JSON.stringify(arabic)
  const translationJson = JSON.stringify(translation)
  const transliterationJson = JSON.stringify(transliteration)

  writeFileSync(path.join(outDir, 'arabic', `${pad3(num)}.json`), arabicJson)
  writeFileSync(path.join(outDir, 'translation-en', `${pad3(num)}.json`), translationJson)
  writeFileSync(path.join(outDir, 'transliteration', `${pad3(num)}.json`), transliterationJson)

  hasher.update(arabicJson).update(translationJson).update(transliterationJson)

  surahMeta.push({
    number: num,
    nameArabic: chapter.name,
    nameTransliteration: chapter.transliteration,
    nameTranslation: full.translation,
    ayahCount: chapter.total_verses,
    revelationPlace: chapter.type,
  })
}

const juz = []
for (let juzNum = 1; juzNum <= 30; juzNum++) {
  const meta = hafs.getJuzMeta(juzNum)
  juz.push({
    juz: juzNum,
    startSurah: meta.first[0],
    startAyah: meta.first[1],
    endSurah: meta.last[0],
    endAyah: meta.last[1],
    startAyahId: meta.firstAyahId,
    endAyahId: meta.lastAyahId,
  })
}

const metaJson = JSON.stringify({ surahs: surahMeta, juz, totalAyahs: 6236 })
writeFileSync(path.join(outDir, 'meta.json'), metaJson)
hasher.update(metaJson)

// Duas: for this pass, sourced only as curated references (surah/ayah
// range) into the Quran text already built above — see
// scripts/content-source/quran-duas.json. Resolving text by reference (not
// retyping it) guarantees the Arabic/translation/transliteration shown for
// each dua is byte-identical to the verified Quran pipeline. A Hadith-
// sourced azkar collection (Morning/Evening Adhkar, Sleep, Travel, etc.)
// was deliberately deferred: a reviewed candidate dataset had accurate,
// well-cited Arabic text but no trustworthy English translation source, and
// religious text should not be machine-translated.
const duasOutDir = path.join(root, 'public/data/duas')
ensureDir(duasOutDir)
const duasSource = JSON.parse(readFileSync(path.join(__dirname, 'content-source/quran-duas.json'), 'utf-8'))
const surahByNumber = new Map(surahMeta.map((s) => [s.number, s]))

const duasByCategory = new Map(duasSource.categories.map((c) => [c.id, []]))
for (const dua of duasSource.duas) {
  const verses = versesBySurah.get(dua.surah)
  const range = verses.filter((v) => v.id >= dua.ayahStart && v.id <= dua.ayahEnd)
  const surah = surahByNumber.get(dua.surah)
  const resolved = {
    id: dua.id,
    title: dua.title,
    reference: dua.ayahStart === dua.ayahEnd
      ? `Surah ${surah.nameTransliteration} ${dua.surah}:${dua.ayahStart}`
      : `Surah ${surah.nameTransliteration} ${dua.surah}:${dua.ayahStart}-${dua.ayahEnd}`,
    surah: dua.surah,
    ayahStart: dua.ayahStart,
    ayahEnd: dua.ayahEnd,
    arabic: range.map((v) => v.text).join(' '),
    translation: range.map((v) => v.translation).join(' '),
    transliteration: range.map((v) => v.transliteration).join(' '),
  }
  duasByCategory.get(dua.categoryId).push(resolved)
}

const categoriesJson = JSON.stringify(
  duasSource.categories.map((c) => ({ ...c, count: duasByCategory.get(c.id).length }))
)
writeFileSync(path.join(duasOutDir, 'categories.json'), categoriesJson)
hasher.update(categoriesJson)

for (const [categoryId, duas] of duasByCategory) {
  const json = JSON.stringify(duas)
  writeFileSync(path.join(duasOutDir, `${categoryId}.json`), json)
  hasher.update(json)
}

console.log(`Built ${duasSource.duas.length} Quran-derived duas across ${duasSource.categories.length} categories.`)

// Wudu & Salah: procedural step descriptions are original content (low
// licensing risk — these are objective ritual steps, not copyrighted text).
// Any *recited* Arabic is resolved by reference, never retyped by hand:
// Qur'an passages come from the verified data above; short liturgical
// phrases (tashahhud, ruku'/sujud tasbih, durood, etc.) come from a
// hadith-cited azkar dataset (islam.js, MIT) that was manually spot-checked
// against well-known texts before use. A couple of extremely short,
// universally-known phrases (the two-word opening takbir, the closing
// taslim greeting) are given directly in content-source/wudu-salah.json.
const azkarModule = (await import('islam.js/lib/assets/azkar-collection.js')).default
const AzkarCollection = azkarModule.AzkarCollection

function cleanAzkarText(raw) {
  // The source wraps each recitation in ( ) or (( )) — inconsistently
  // positioned relative to trailing repetition annotations like "ثلاث
  // مرَّاتٍ." (three times) — so strip all parens rather than anchoring to
  // start/end, then collapse the double/triple periods that wrapper removal
  // leaves behind.
  return raw
    .replace(/[()]/g, '')
    .replace(/\.{2,}$/, '.')
    .replace(/\s+/g, ' ')
    .trim()
}

function resolveArabicSource(source) {
  if (!source) return null
  if (source.type === 'literal') {
    return {
      arabic: source.arabic,
      transliteration: source.transliteration,
      translation: source.translation,
      translationLang: source.translationLang ?? null,
    }
  }
  if (source.type === 'quran') {
    const verses = versesBySurah.get(source.surah)
    const end = source.ayahEnd ?? source.ayah
    const range = verses.filter((v) => v.id >= source.ayah && v.id <= end)
    return {
      arabic: range.map((v) => v.text).join(' '),
      transliteration: range.map((v) => v.transliteration).join(' '),
      translation: range.map((v) => v.translation).join(' '),
      // Quran renderings are always the verified Saheeh International English
      // translation — never hand-written Urdu — so this is never overridden.
      translationLang: 'en',
    }
  }
  if (source.type === 'azkar') {
    const entries = AzkarCollection[source.category]
    if (!entries) throw new Error(`Unknown azkar category: ${source.category}`)
    const arabic = source.indexes.map((i) => cleanAzkarText(entries[i].zikr)).join(' ')
    return { arabic, transliteration: null, translation: null, translationLang: null }
  }
  throw new Error(`Unknown arabicSource type: ${source.type}`)
}

const wuduSalahSource = JSON.parse(readFileSync(path.join(__dirname, 'content-source/wudu-salah.json'), 'utf-8'))
const wuduOutDir = path.join(root, 'public/data/wudu')
const salahOutDir = path.join(root, 'public/data/salah')
ensureDir(wuduOutDir)
ensureDir(salahOutDir)

const wuduSteps = wuduSalahSource.wudu.map((step, i) => ({
  id: step.id,
  order: i + 1,
  title: step.title,
  description: step.description,
  fiqhType: step.fiqhType ?? null,
  note: step.note ?? null,
  ...resolveArabicSource(step.arabicSource),
}))
const wuduJson = JSON.stringify(wuduSteps)
writeFileSync(path.join(wuduOutDir, 'steps.json'), wuduJson)
hasher.update(wuduJson)

for (const variant of wuduSalahSource.salahVariants) {
  const steps = variant.steps.map((step, i) => ({
    id: step.id,
    order: i + 1,
    title: step.title,
    description: step.description,
    fiqhType: step.fiqhType ?? null,
    note: step.note ?? null,
    ...resolveArabicSource(step.arabicSource),
  }))
  const variantJson = JSON.stringify({
    id: variant.id,
    label: variant.label,
    description: variant.description,
    preconditions: variant.preconditions ?? [],
    steps,
  })
  writeFileSync(path.join(salahOutDir, `${variant.id}.json`), variantJson)
  hasher.update(variantJson)
}

console.log(`Built ${wuduSteps.length} Wudu steps and ${wuduSalahSource.salahVariants.length} Salah variant(s).`)

// Blogs & Islamic Stories: original editorial content (not copyrighted
// religious text), authored conservatively — historical/biographical claims
// are kept to well-established, uncontroversial facts and phrased as
// general summaries rather than invented dialogue or unverifiable detail.
const storiesSource = JSON.parse(readFileSync(path.join(__dirname, 'content-source/stories.json'), 'utf-8'))
const blogsSource = JSON.parse(readFileSync(path.join(__dirname, 'content-source/blogs.json'), 'utf-8'))

function buildArticleCollection(source, itemsKey, outDirName) {
  const outDir = path.join(root, 'public/data', outDirName)
  ensureDir(outDir)
  const byCategory = new Map(source.categories.map((c) => [c.id, []]))
  for (const item of source[itemsKey]) {
    byCategory.get(item.categoryId).push(item)
  }
  const categoriesJson = JSON.stringify(
    source.categories.map((c) => ({ ...c, count: byCategory.get(c.id).length }))
  )
  writeFileSync(path.join(outDir, 'categories.json'), categoriesJson)
  hasher.update(categoriesJson)
  for (const [categoryId, items] of byCategory) {
    const json = JSON.stringify(items)
    writeFileSync(path.join(outDir, `${categoryId}.json`), json)
    hasher.update(json)
  }
  // Flat index of every item (with categoryId embedded) — lets the list
  // page group by category from a single fetch, and the detail page look up
  // one item by id without knowing which category file it lives in.
  const allJson = JSON.stringify(source[itemsKey])
  writeFileSync(path.join(outDir, 'all.json'), allJson)
  hasher.update(allJson)
  return source[itemsKey].length
}

const storyCount = buildArticleCollection(storiesSource, 'stories', 'stories')
const blogCount = buildArticleCollection(blogsSource, 'articles', 'blogs')
console.log(`Built ${storyCount} stories and ${blogCount} blog articles.`)

const contentVersion = hasher.digest('hex').slice(0, 12)
writeFileSync(
  path.join(outDir, '../content-version.json'),
  JSON.stringify({ version: contentVersion, generatedAt: new Date().toISOString() })
)

console.log(`Built Quran content for ${surahMeta.length} surahs. content-version=${contentVersion}`)
