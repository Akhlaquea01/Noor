import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HandHeart } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import { SearchInput } from '../../shared/ui/SearchInput'
import { getDuaCategories, getAllDuas } from './api/duaContent'
import { DuaCard } from './DuaListPage'
import type { DuaCategory, Dua } from './types'
import './DuaCategoriesPage.css'

function matchesQuery(dua: Dua, q: string): boolean {
  return (
    dua.title.toLowerCase().includes(q) ||
    dua.reference.toLowerCase().includes(q) ||
    dua.arabic.includes(q) ||
    dua.translation.toLowerCase().includes(q) ||
    dua.transliteration.toLowerCase().includes(q)
  )
}

export function DuaCategoriesPage() {
  const [categories, setCategories] = useState<DuaCategory[] | null>(null)
  const [allDuas, setAllDuas] = useState<Dua[] | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    void getDuaCategories().then(setCategories)
  }, [])

  // Loaded lazily on first keystroke rather than alongside categories — the
  // category list alone is enough for the default (non-search) view, so
  // there's no reason to fetch every category's duas up front.
  useEffect(() => {
    if (query.trim() && !allDuas) void getAllDuas().then(setAllDuas)
  }, [query, allDuas])

  const searching = query.trim().length > 0
  const results = useMemo(() => {
    if (!searching || !allDuas) return []
    const q = query.trim().toLowerCase()
    return allDuas.filter((d) => matchesQuery(d, q))
  }, [searching, allDuas, query])

  return (
    <section className="dua-categories-page">
      <h1>Duas</h1>
      <p className="dua-categories-page__note">
        Supplications from the Qur'an and authentic hadith, with Arabic, translation, and transliteration.
      </p>

      <SearchInput value={query} onChange={setQuery} placeholder="Search duas" ariaLabel="Search duas" />

      {searching ? (
        <>
          {!allDuas && (
            <div className="dua-categories-page__skeletons">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} height="8rem" radius="var(--radius-lg)" />
              ))}
            </div>
          )}
          {allDuas && results.length === 0 && (
            <p className="dua-categories-page__empty">No duas match "{query}".</p>
          )}
          {allDuas && results.length > 0 && (
            <div className="dua-categories-page__results">
              {results.map((d) => (
                <DuaCard key={d.id} dua={d} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {!categories && (
            <div className="dua-categories-page__skeletons">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height="4.5rem" radius="var(--radius-lg)" />
              ))}
            </div>
          )}

          {categories && (
            <ul className="dua-categories-page__list">
              {categories.map((c) => (
                <li key={c.id}>
                  <GlassCard
                    as={Link}
                    to={`/duas/${c.id}`}
                    viewTransition
                    interactive
                    className="dua-categories-page__row"
                  >
                    <HandHeart size={20} aria-hidden="true" className="dua-categories-page__icon" />
                    <div>
                      <strong>{c.label}</strong>
                      <p>
                        {c.count} dua{c.count === 1 ? '' : 's'}
                      </p>
                    </div>
                  </GlassCard>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
