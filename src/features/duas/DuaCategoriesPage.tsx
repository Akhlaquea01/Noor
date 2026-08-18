import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HandHeart } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import { getDuaCategories } from './api/duaContent'
import type { DuaCategory } from './types'
import './DuaCategoriesPage.css'

export function DuaCategoriesPage() {
  const [categories, setCategories] = useState<DuaCategory[] | null>(null)

  useEffect(() => {
    void getDuaCategories().then(setCategories)
  }, [])

  return (
    <section className="dua-categories-page">
      <h1>Duas</h1>
      <p className="dua-categories-page__note">
        Supplications from the Qur'an, with Arabic, translation, and transliteration.
      </p>

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
              <GlassCard as={Link} to={`/duas/${c.id}`} viewTransition interactive className="dua-categories-page__row">
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
    </section>
  )
}
