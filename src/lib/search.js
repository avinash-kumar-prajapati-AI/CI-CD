import Fuse from 'fuse.js';

export function createArticleFuse(articles = []) {
  return new Fuse(articles, {
    threshold: 0.32,
    ignoreLocation: true,
    keys: [
      { name: 'title', weight: 0.45 },
      { name: 'description', weight: 0.25 },
      { name: 'tags', weight: 0.2 },
      { name: 'category', weight: 0.1 }
    ]
  });
}
