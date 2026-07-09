import type { APIRoute } from "astro";
import { isAuthenticated } from "../../../lib/admin/auth";
import { contentMode, saveImage } from "../../../lib/admin/content";

export const prerender = false;

const MAX_BYTES = 4 * 1024 * 1024;

const json = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return json(401, { error: "Please sign in again." });
  if (contentMode() === "unconfigured") {
    return json(503, { error: "Publishing isn't configured yet (missing BLOG_GITHUB_TOKEN)." });
  }

  const payload = await request.json().catch(() => null);
  if (!payload) return json(400, { error: "Invalid request." });

  const kind = payload.kind === "covers" ? "covers" : "inline";
  const filename = String(payload.filename ?? "photo.jpg");
  const data = String(payload.data ?? "");

  if (!data) return json(400, { error: "No image received." });
  if ((data.length * 3) / 4 > MAX_BYTES) {
    return json(413, { error: "That photo is too large — please pick one under 4 MB." });
  }

  try {
    const path = await saveImage(kind, filename, data);
    return json(200, { ok: true, path });
  } catch (error) {
    console.error("Failed to upload image:", error);
    return json(502, { error: "Could not upload the photo. Please try again." });
  }
};
