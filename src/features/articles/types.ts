export type ArticleKind = 'blog' | 'story'

export interface ArticleCategory {
  id: string
  label: string
  count: number
}

export interface Article {
  id: string
  categoryId: string
  title: string
  summary: string
  body: string
  reference?: string
}
