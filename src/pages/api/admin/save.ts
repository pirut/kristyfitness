import type { APIRoute } from "astro";
import { isAuthenticated } from "../../../lib/admin/auth";
import {
  contentMode,
  getPost,
  savePost,
  slugify,
  type PostFrontmatter,
} from "../../../lib/admin/content";

export const prerender = false;

const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return json(401, { error: "Please sign in again." });
  if (contentMode() === "unconfigured") {
    return json(503, { error: "Publishing isn't configured yet (missing BLOG_GITHUB_TOKEN)." });
  }

  const payload = await request.json().catch(() => null);
  if (!payload) return json(400, { error: "Invalid request." });

  const title = String(payload.title ?? "").trim();
  const publishDate = String(payload.publishDate ?? "").trim();
  const excerpt = String(payload.excerpt ?? "").trim();
  const body = String(payload.body ?? "").trim();
  const isNew = Boolean(payload.isNew);

  if (title.length < 8) return json(400, { error: "The title needs to be at least 8 characters." });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishDate)) return json(400, { error: "Please pick a date." });
  if (excerpt.length < 30) {
    return json(400, { error: "The short description needs at least 30 characters." });
  }
  if (excerpt.length > 220) {
    return json(400, { error: "The short description can be at most 220 characters." });
  }
  if (!body) return json(400, { error: "The post needs some words in it first!" });

  const tags = Array.isArray(payload.tags)
    ? payload.tags.map((tag: unknown) => String(tag).trim()).filter((tag: string) => tag.length >= 2).slice(0, 8)
    : [];

  let slug: string;
  let sha: string | null = null;
  let author = "Kristy";
  let updatedDate: string | null = null;

  if (isNew) {
    slug = slugify(title);
    // Avoid overwriting an existing post with the same name.
    let candidate = slug;
    for (let i = 2; (await getPost(candidate)) !== null; i++) {
      candidate = `${slug}-${i}`;
      if (i > 20) return json(400, { error: "Too many posts with this title — try another." });
    }
    slug = candidate;
  } else {
    slug = slugify(String(payload.slug ?? ""));
    const existing = await getPost(slug);
    if (!existing) return json(404, { error: "This post no longer exists." });
    sha = existing.sha;
    author = existing.frontmatter.author || "Kristy";
    updatedDate = new Date().toISOString().slice(0, 10);
  }

  const frontmatter: PostFrontmatter = {
    title,
    slug,
    publishDate,
    updatedDate,
    excerpt,
    coverImage: payload.coverImage ? String(payload.coverImage) : null,
    tags,
    author,
    draft: Boolean(payload.draft),
    seoTitle: "",
    seoDescription: "",
  };

  try {
    await savePost(frontmatter, body, sha);
  } catch (error) {
    console.error("Failed to save post:", error);
    return json(502, { error: "Could not save right now. Please try again in a minute." });
  }

  return json(200, { ok: true, slug });
};
