import { Octokit } from '@octokit/rest';
import {
  DEFAULT_BRANCH,
  decodeBase64Unicode,
  getReadingTime,
  parseCommitMeta,
  parseMarkdownFile,
  extractTableOfContents
} from './utils';

export const OWNER = 'avinash-kumar-prajapati-AI';
export const REPO = 'CI-CD';
export const BRANCH = 'main';

export const octokit = new Octokit();

function ensureConfig() {
  if (!OWNER || !REPO) {
    throw new Error('Missing GitHub configuration.');
  }
}

async function getLatestCommitMeta(path) {
  const response = await octokit.repos.listCommits({
    owner: OWNER,
    repo: REPO,
    path,
    per_page: 1
  });

  const latestCommit = response.data[0];
  const parsed = parseCommitMeta(latestCommit?.commit?.message || '');
  return {
    ...parsed,
    authorAvatar: latestCommit?.author?.avatar_url || `https://github.com/${OWNER}.png`,
    committedAt: latestCommit?.commit?.author?.date || null
  };
}

function toArticleRecord(file, rawMarkdown, commitMeta) {
  const parsed = parseMarkdownFile(rawMarkdown);
  const [category, filename] = file.path.split('/');
  const slug = filename.replace(/\.md$/i, '');
  const title = parsed.frontmatter.title || slug.replace(/-/g, ' ');
  const date = parsed.frontmatter.date || commitMeta.committedAt || '';
  const description = parsed.frontmatter.description || commitMeta.description || '';
  const body = parsed.body || '';

  return {
    title,
    date,
    description,
    coverImage: parsed.frontmatter.coverImage || '',
    body,
    tags: commitMeta.tags || [],
    category,
    slug,
    path: file.path,
    sha: file.sha,
    authorAvatar: commitMeta.authorAvatar,
    readingTime: getReadingTime(body),
    tableOfContents: extractTableOfContents(body),
    downloadUrl: file.url
  };
}

export async function listCategories() {
  ensureConfig();
  const response = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path: '',
    ref: BRANCH
  });

  return Array.isArray(response.data)
    ? response.data.filter((item) => item.type === 'dir').map((item) => item.name)
    : [];
}

export async function getRepoMarkdownFiles() {
  ensureConfig();
  const response = await octokit.git.getTree({
    owner: OWNER,
    repo: REPO,
    tree_sha: BRANCH,
    recursive: 'true'
  });

  return response.data.tree.filter((item) => item.type === 'blob' && item.path.endsWith('.md'));
}

export async function getArticleByPath(path) {
  ensureConfig();
  const [contentResponse, commitMeta] = await Promise.all([
    octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
      ref: BRANCH
    }),
    getLatestCommitMeta(path)
  ]);

  const data = contentResponse.data;
  if (Array.isArray(data) || data.type !== 'file') {
    throw new Error(`Unable to load article at ${path}`);
  }

  const rawMarkdown = decodeBase64Unicode(data.content || '');
  return toArticleRecord(
    {
      path,
      sha: data.sha
    },
    rawMarkdown,
    commitMeta
  );
}

export async function getAllArticles() {
  const files = await getRepoMarkdownFiles();
  const articles = await Promise.all(
    files.map(async (file) => {
      const article = await getArticleByPath(file.path);
      return {
        ...article,
        sha: file.sha
      };
    })
  );

  return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
}
