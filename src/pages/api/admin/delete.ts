import type { APIRoute } from "astro";
import { isAuthenticated } from "../../../lib/admin/auth";
import { contentMode, deletePost } from "../../../lib/admin/content";

export const prerender = false;

const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return json(401, { error: "Please sign in again." });
  if (contentMode() === "unconfigured") {
    return json(503, { error: "Publishing isn't configured yet (missing BLOG_GITHUB_TOKEN)." });
  }

  const payload = await request.json().catch(() => null);
  const slug = String(payload?.slug ?? "").trim();
  if (!slug) return json(400, { error: "Missing post name." });

  try {
    await deletePost(slug);
    return json(200, { ok: true });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return json(502, { error: "Could not delete right now. Please try again." });
  }
};
