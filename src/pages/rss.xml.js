import rss from "@astrojs/rss";
import { getAllPosts } from "../lib/blog";
import { SITE_NAME } from "../lib/site";

export const prerender = true;

export async function GET(context) {
  const posts = await getAllPosts();

  return rss({
    title: `${SITE_NAME} Blog`,
    description:
      "Practical tips and encouragement for moving better, eating well, and staying active at any age.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.title,
      description: post.seoDescription || post.excerpt,
      link: `/blog/${post.slug}`,
      pubDate: new Date(post.publishDate),
    })),
  });
}
