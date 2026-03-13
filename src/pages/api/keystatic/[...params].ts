import { makeHandler } from "@keystatic/astro/api";
import type { APIContext } from "astro";
import keystaticConfig from "../../../../keystatic.config";
import { SITE_URL } from "../../../lib/site";

export const prerender = false;

const handler = makeHandler({ config: keystaticConfig });

function withCanonicalOrigin(context: APIContext): APIContext {
  if (!import.meta.env.PROD) return context;

  const requestUrl = new URL(context.request.url);
  const canonicalUrl = new URL(SITE_URL);

  if (requestUrl.origin === canonicalUrl.origin) {
    return context;
  }

  const rewrittenUrl = new URL(requestUrl.pathname + requestUrl.search, canonicalUrl);
  const rewrittenRequest = new Request(rewrittenUrl, context.request);

  return {
    ...context,
    request: rewrittenRequest,
  };
}

export async function ALL(context: APIContext) {
  return handler(withCanonicalOrigin(context));
}
