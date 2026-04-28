import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './pages/RootLayout';
import { HomePage } from './pages/HomePage';
import { BlogPage } from './pages/BlogPage';
import { CategoryPage } from './pages/CategoryPage';
import { ArticlePage } from './pages/ArticlePage';
import { SearchPage } from './pages/SearchPage';
import { NotFoundPage } from './pages/NotFoundPage';

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
            path: ':category',
            children: [
              {
                index: true,
                element: <CategoryPage />
              },
              {
                path: ':slug',
                element: <ArticlePage />
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
