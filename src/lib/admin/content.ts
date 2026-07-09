import fs from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

const REPO = "pirut/kristyfitness";
const BRANCH = "main";
const BLOG_DIR = "src/content/blog";
const GITHUB_API = "https://api.github.com";

export interface PostFrontmatter {
  title: string;
  slug: string;
  publishDate: string;
  updatedDate?: string | null;
  excerpt: string;
  coverImage?: string | null;
  tags: string[];
  author: string;
  draft: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface PostFile {
  frontmatter: PostFrontmatter;
  body: string;
  sha: string | null;
}

export interface PostSummary {
  slug: string;
  title: string;
  publishDate: string;
  excerpt: string;
  draft: boolean;
}

function githubToken(): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env?.BLOG_GITHUB_TOKEN : undefined;
  return fromProcess ?? (import.meta.env as Record<string, string | undefined>).BLOG_GITHUB_TOKEN;
}

export type ContentMode = "github" | "local" | "unconfigured";

export function contentMode(): ContentMode {
  if (githubToken()) return "github";
  if (import.meta.env.DEV) return "local";
  return "unconfigured";
}

/* ---------- (de)serialization ---------- */

export function parsePostFile(raw: string): { frontmatter: PostFrontmatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error("Post file is missing its settings block.");
  const data = (parseYaml(match[1]) ?? {}) as Record<string, unknown>;
  const frontmatter: PostFrontmatter = {
    title: String(data.title ?? ""),
    slug: String(data.slug ?? ""),
    publishDate: String(data.publishDate ?? ""),
    updatedDate: data.updatedDate ? String(data.updatedDate) : null,
    excerpt: String(data.excerpt ?? ""),
    coverImage: data.coverImage ? String(data.coverImage) : null,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    author: String(data.author ?? "Kristy"),
    draft: Boolean(data.draft),
    seoTitle: data.seoTitle ? String(data.seoTitle) : "",
    seoDescription: data.seoDescription ? String(data.seoDescription) : "",
  };
  return { frontmatter, body: match[2].replace(/^\r?\n/, "") };
}

export function serializePostFile(frontmatter: PostFrontmatter, body: string): string {
  const data: Record<string, unknown> = {
    title: frontmatter.title,
    slug: frontmatter.slug,
    publishDate: frontmatter.publishDate,
    ...(frontmatter.updatedDate ? { updatedDate: frontmatter.updatedDate } : {}),
    excerpt: frontmatter.excerpt,
    ...(frontmatter.coverImage ? { coverImage: frontmatter.coverImage } : {}),
    tags: frontmatter.tags,
    author: frontmatter.author || "Kristy",
    draft: frontmatter.draft,
    seoTitle: frontmatter.seoTitle ?? "",
    seoDescription: frontmatter.seoDescription ?? "",
  };
  return `---\n${stringifyYaml(data)}---\n${body.trim()}\n`;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "post";
}

/* ---------- GitHub helpers ---------- */

async function gh(pathname: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(`${GITHUB_API}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${githubToken()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
  return response;
}

async function ghJson<T>(pathname: string, init?: RequestInit): Promise<T> {
  const response = await gh(pathname, init);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`GitHub API ${response.status}: ${detail.slice(0, 300)}`);
  }
  return (await response.json()) as T;
}

/* ---------- post operations ---------- */

export async function listPosts(): Promise<PostSummary[]> {
  const mode = contentMode();
  const summaries: PostSummary[] = [];

  if (mode === "local") {
    const dir = path.join(process.cwd(), BLOG_DIR);
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const raw = await fs.readFile(path.join(dir, entry.name, "index.mdoc"), "utf8");
        const { frontmatter } = parsePostFile(raw);
        summaries.push({
          slug: entry.name,
          title: frontmatter.title,
          publishDate: frontmatter.publishDate,
          excerpt: frontmatter.excerpt,
          draft: frontmatter.draft,
        });
      } catch {
        // Skip folders that aren't valid posts.
      }
    }
  } else if (mode === "github") {
    const listing = await ghJson<Array<{ name: string; type: string }>>(
      `/repos/${REPO}/contents/${BLOG_DIR}?ref=${BRANCH}`
    ).catch((error) => {
      if (String(error).includes("404")) return [];
      throw error;
    });
    const dirs = listing.filter((item) => item.type === "dir");
    const posts = await Promise.all(
      dirs.map(async (dir) => {
        try {
          const post = await getPost(dir.name);
          if (!post) return null;
          return {
            slug: dir.name,
            title: post.frontmatter.title,
            publishDate: post.frontmatter.publishDate,
            excerpt: post.frontmatter.excerpt,
            draft: post.frontmatter.draft,
          };
        } catch {
          return null;
        }
      })
    );
    summaries.push(...posts.filter((post): post is PostSummary => post !== null));
  }

  return summaries.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}

export async function getPost(slug: string): Promise<PostFile | null> {
  const safeSlug = slugify(slug);
  const filePath = `${BLOG_DIR}/${safeSlug}/index.mdoc`;

  if (contentMode() === "local") {
    try {
      const raw = await fs.readFile(path.join(process.cwd(), filePath), "utf8");
      return { ...parsePostFile(raw), sha: null };
    } catch {
      return null;
    }
  }

  const response = await gh(`/repos/${REPO}/contents/${filePath}?ref=${BRANCH}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub API ${response.status}`);
  const file = (await response.json()) as { content: string; sha: string };
  const raw = Buffer.from(file.content, "base64").toString("utf8");
  return { ...parsePostFile(raw), sha: file.sha };
}

export async function savePost(
  frontmatter: PostFrontmatter,
  body: string,
  sha: string | null
): Promise<void> {
  const filePath = `${BLOG_DIR}/${frontmatter.slug}/index.mdoc`;
  const contents = serializePostFile(frontmatter, body);

  if (contentMode() === "local") {
    const absolute = path.join(process.cwd(), filePath);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, contents, "utf8");
    return;
  }

  await ghJson(`/repos/${REPO}/contents/${filePath}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `blog: ${sha ? "update" : "add"} "${frontmatter.title}"`,
      content: Buffer.from(contents, "utf8").toString("base64"),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
}

export async function deletePost(slug: string): Promise<void> {
  const safeSlug = slugify(slug);
  const filePath = `${BLOG_DIR}/${safeSlug}/index.mdoc`;

  if (contentMode() === "local") {
    const absolute = path.join(process.cwd(), filePath);
    await fs.rm(absolute, { force: true });
    await fs.rmdir(path.dirname(absolute)).catch(() => {});
    return;
  }

  const post = await getPost(safeSlug);
  if (!post?.sha) return;
  await ghJson(`/repos/${REPO}/contents/${filePath}`, {
    method: "DELETE",
    body: JSON.stringify({
      message: `blog: delete "${post.frontmatter.title}"`,
      sha: post.sha,
      branch: BRANCH,
    }),
  });
}

export async function saveImage(
  kind: "covers" | "inline",
  filename: string,
  base64Data: string
): Promise<string> {
  const cleanName = filename
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-60);
  const uniqueName = `${Date.now().toString(36)}-${cleanName || "photo.jpg"}`;
  const filePath = `public/blog/${kind}/${uniqueName}`;

  if (contentMode() === "local") {
    const absolute = path.join(process.cwd(), filePath);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, Buffer.from(base64Data, "base64"));
  } else {
    await ghJson(`/repos/${REPO}/contents/${filePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `blog: upload image ${uniqueName}`,
        content: base64Data,
        branch: BRANCH,
      }),
    });
  }

  return `/blog/${kind}/${uniqueName}`;
}
