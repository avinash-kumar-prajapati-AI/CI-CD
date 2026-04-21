import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './pages/RootLayout';
import { HomePage } from './pages/HomePage';
import { BlogPage } from './pages/BlogPage';
import { CategoryPage } from './pages/CategoryPage';
import { ArticlePage } from './pages/ArticlePage';
import { EditorPage } from './pages/EditorPage';
import { SearchPage } from './pages/SearchPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminRoute } from './routes/AdminRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'blog',
        children: [
          {
            index: true,
            element: <BlogPage />
          },
          {
            path: 'new',
            element: (
              <AdminRoute>
                <EditorPage mode="create" />
              </AdminRoute>
            )
          },
          {
            path: ':category',
            children: [
              {
                index: true,
                element: <CategoryPage />
              },
              {
                path: ':slug',
                children: [
                  {
                    index: true,
                    element: <ArticlePage />
                  },
                  {
                    path: 'edit',
                    element: (
                      <AdminRoute>
                        <EditorPage mode="edit" />
                      </AdminRoute>
                    )
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        path: 'search',
        element: <SearchPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);
