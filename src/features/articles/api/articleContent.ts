import type { ArticleKind, ArticleCategory, Article } from '../types'

const DIR: Record<ArticleKind, string> = { blog: 'blogs', story: 'stories' }

export function getArticleCategories(kind: ArticleKind): Promise<ArticleCategory[]> {
  return fetch(`/data/${DIR[kind]}/categories.json`).then((r) => r.json())
}

export function getArticlesByCategory(kind: ArticleKind, categoryId: string): Promise<Article[]> {
  return fetch(`/data/${DIR[kind]}/${categoryId}.json`).then((r) => r.json())
}

const allCache: Partial<Record<ArticleKind, Promise<Article[]>>> = {}

export function getAllArticles(kind: ArticleKind): Promise<Article[]> {
  if (!allCache[kind]) {
    allCache[kind] = fetch(`/data/${DIR[kind]}/all.json`).then((r) => r.json())
  }
  return allCache[kind] as Promise<Article[]>
}

export async function getArticleById(kind: ArticleKind, id: string): Promise<Article | undefined> {
  const all = await getAllArticles(kind)
  return all.find((a) => a.id === id)
}
