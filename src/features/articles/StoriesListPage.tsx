import { ArticleListPage } from './ArticleListPage'

export function StoriesListPage() {
  return (
    <ArticleListPage
      kind="story"
      title="Islamic Stories"
      note="Stories from the life of the Prophet ﷺ and his companions."
      basePath="/stories"
    />
  )
}
