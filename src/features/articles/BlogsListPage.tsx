import { ArticleListPage } from './ArticleListPage'

export function BlogsListPage() {
  return (
    <ArticleListPage
      kind="blog"
      title="Blogs"
      note="Short articles on Islamic practice and reflection."
      basePath="/blogs"
    />
  )
}
