import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { GlassCard } from '../../shared/ui/GlassCard'
import { Skeleton } from '../../shared/ui/Skeleton'
import { BookmarkButton } from '../bookmarks-favorites/BookmarkButton'
import { getArticleById } from './api/articleContent'
import { articleProgressRepo } from '../../shared/db/repositories'
import type { ArticleKind, Article } from './types'
import './ArticleDetailPage.css'

interface ArticleDetailPageProps {
  kind: ArticleKind
  basePath: string
  backLabel: string
}

export function ArticleDetailPage({ kind, basePath, backLabel }: ArticleDetailPageProps) {
  const { articleId, storyId } = useParams()
  const id = articleId ?? storyId ?? ''
  const [article, setArticle] = useState<Article | null>(null)

  useEffect(() => {
    if (!id) return
    setArticle(null)
    void getArticleById(kind, id).then((found) => {
      setArticle(found ?? null)
      if (found) void articleProgressRepo.put(id, { articleId: id, lastReadAt: Date.now(), readComplete: true })
    })
  }, [kind, id])

  return (
    <section className="article-detail-page">
      <Link to={basePath} className="article-detail-page__back">
        <ChevronLeft size={18} aria-hidden="true" /> {backLabel}
      </Link>

      {!article && (
        <div className="article-detail-page__skeleton">
          <Skeleton height="2rem" radius="var(--radius-sm)" />
          <Skeleton height="10rem" radius="var(--radius-lg)" />
        </div>
      )}

      {article && (
        <GlassCard className="article-detail-page__card">
          <div className="article-detail-page__header">
            <h1>{article.title}</h1>
            <BookmarkButton contentType={kind === 'blog' ? 'article' : 'story'} refId={article.id} extra={{ articleId: article.id, note: article.title }} />
          </div>
          <p className="article-detail-page__body">{article.body}</p>
          {article.reference && <p className="article-detail-page__reference">{article.reference}</p>}
        </GlassCard>
      )}
    </section>
  )
}
