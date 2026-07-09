import type { APIRoute } from "astro";
import {
  COOKIE_NAME,
  SESSION_MS,
  checkPassword,
  createSessionToken,
  isAuthConfigured,
} from "../../../lib/admin/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthConfigured()) {
    return new Response(JSON.stringify({ error: "Admin is not set up yet." }), { status: 503 });
  }

  const payload = await request.json().catch(() => ({}));
  const password = typeof payload?.password === "string" ? payload.password : "";

  // Slow the response down uniformly to blunt password guessing.
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!password || !checkPassword(password)) {
    return new Response(JSON.stringify({ error: "That password isn't right — try again." }), {
      status: 401,
    });
  }

  cookies.set(COOKIE_NAME, createSessionToken(), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    maxAge: Math.floor(SESSION_MS / 1000),
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
