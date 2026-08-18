import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import { getAllArticles, getArticleCategories } from './api/articleContent'
import { articleProgressRepo } from '../../shared/db/repositories'
import type { ArticleKind, Article, ArticleCategory } from './types'
import './ArticleListPage.css'

interface ArticleListPageProps {
  kind: ArticleKind
  title: string
  note: string
  basePath: string
}

export function ArticleListPage({ kind, title, note, basePath }: ArticleListPageProps) {
  const [articles, setArticles] = useState<Article[] | null>(null)
  const [categories, setCategories] = useState<ArticleCategory[] | null>(null)
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    void getAllArticles(kind).then(setArticles)
    void getArticleCategories(kind).then(setCategories)
    void articleProgressRepo
      .list()
      .then((list) => setReadIds(new Set(list.filter((p) => p.readComplete).map((p) => p.articleId))))
  }, [kind])

  return (
    <section className="article-list-page">
      <h1>{title}</h1>
      <p className="article-list-page__note">{note}</p>

      {(!articles || !categories) && (
        <div className="article-list-page__skeletons">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="4.5rem" radius="var(--radius-lg)" />
          ))}
        </div>
      )}

      {articles && categories && (
        <div className="article-list-page__groups">
          {categories.map((cat) => (
            <div key={cat.id} className="article-list-page__group">
              <h2>{cat.label}</h2>
              <ul className="article-list-page__list">
                {articles
                  .filter((a) => a.categoryId === cat.id)
                  .map((a) => (
                    <li key={a.id}>
                      <GlassCard
                        as={Link}
                        to={`${basePath}/${a.id}`}
                        viewTransition
                        interactive
                        className="article-list-page__row"
                      >
                        <div>
                          <strong>{a.title}</strong>
                          <p>{a.summary}</p>
                        </div>
                        <div className="article-list-page__row-end">
                          {readIds.has(a.id) && <span className="article-list-page__read-badge">Read</span>}
                          <ChevronRight size={16} aria-hidden="true" />
                        </div>
                      </GlassCard>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
