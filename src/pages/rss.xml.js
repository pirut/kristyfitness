import rss from "@astrojs/rss";
import { getAllPosts } from "../lib/blog";

export const prerender = true;

export async function GET(context) {
  const posts = await getAllPosts();

  return rss({
    title: "Kingdom Health Journal",
    description:
      "Biblical encouragement for health, stewardship, and steady restoration.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.title,
      description: post.seoDescription || post.excerpt,
      link: `/blog/${post.slug}`,
      pubDate: new Date(post.publishDate),
    })),
  });
}
