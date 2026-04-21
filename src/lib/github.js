import { Octokit } from '@octokit/rest';
import {
  DEFAULT_BRANCH,
  buildCommitMessage,
  buildMarkdownDocument,
  decodeBase64Unicode,
  encodeBase64Unicode,
  getReadingTime,
  parseCommitMeta,
  parseMarkdownFile,
  extractTableOfContents,
  slugify
} from './utils';

export const OWNER = import.meta.env.VITE_GITHUB_OWNER || '';
export const REPO = import.meta.env.VITE_GITHUB_REPO || '';
export const BRANCH = DEFAULT_BRANCH;

export const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN || undefined
});

function ensureConfig() {
  if (!OWNER || !REPO) {
    throw new Error('Missing GitHub configuration. Add VITE_GITHUB_OWNER and VITE_GITHUB_REPO.');
  }
}

async function resolveFileSha(path) {
  try {
    const response = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
      ref: BRANCH
    });

    if (Array.isArray(response.data) || response.data.type !== 'file') {
      return null;
    }

    return response.data.sha || null;
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
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

export async function createCategory(folderName) {
  ensureConfig();
  const category = slugify(folderName);
  if (!category) {
    throw new Error('Category name is required.');
  }

  const categoryPlaceholderPath = `${category}/.gitkeep`;
  const existingSha = await resolveFileSha(categoryPlaceholderPath);

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: categoryPlaceholderPath,
    message: buildCommitMessage(['category'], `Created category ${category}`),
    content: encodeBase64Unicode('placeholder'),
    branch: BRANCH,
    ...(existingSha ? { sha: existingSha } : {})
  });

  return category;
}

export async function saveArticle({
  title,
  description,
  coverImage,
  date,
  body,
  tags,
  category,
  slug,
  currentSha,
  originalPath
}) {
  ensureConfig();
  const finalCategory = slugify(category);
  const finalSlug = slugify(slug || title);

  if (!finalCategory || !finalSlug) {
    throw new Error('Category and slug are required.');
  }

  const path = `${finalCategory}/${finalSlug}.md`;
  const content = buildMarkdownDocument({ title, description, coverImage, date, body });
  const message = buildCommitMessage(tags, description);
  const resolvedSha = currentSha || (await resolveFileSha(path));

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message,
    content: encodeBase64Unicode(content),
    branch: BRANCH,
    ...(resolvedSha ? { sha: resolvedSha } : {})
  });

  if (originalPath && originalPath !== path) {
    await deleteArticle({
      path: originalPath,
      message: buildCommitMessage(tags, `Removed moved article ${originalPath}`)
    });
  }

  return getArticleByPath(path);
}

export async function deleteArticle({ path, sha, message }) {
  ensureConfig();
  let resolvedSha = sha;
  if (!resolvedSha) {
    const file = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
      ref: BRANCH
    });
    if (Array.isArray(file.data) || file.data.type !== 'file') {
      throw new Error('Could not resolve file sha for deletion.');
    }
    resolvedSha = file.data.sha;
  }

  await octokit.repos.deleteFile({
    owner: OWNER,
    repo: REPO,
    path,
    sha: resolvedSha,
    message: message || buildCommitMessage(['delete'], `Deleted ${path}`),
    branch: BRANCH
  });

  return true;
}
