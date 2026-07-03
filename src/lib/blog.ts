import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

const reader = createReader(process.cwd(), keystaticConfig);

const defaultSettings = {
  introEyebrow: "The Kristy Fitness Blog",
  introTitle: "Tips and encouragement for moving better at any age.",
  introText:
    "Practical advice from Kristy on water training, nutrition, and staying active — written for real people at every fitness level.",
  defaultAuthor: "Kristy",
  emptyStateMessage: "Fresh articles will appear here soon.",
};

const sortNewestFirst = <T extends { publishDate: string }>(posts: T[]) =>
  posts.sort(
    (left, right) =>
      new Date(right.publishDate).getTime() - new Date(left.publishDate).getTime()
  );

export async function getBlogSettings() {
  const settings = await reader.singletons.blogSettings.read();
  return settings ?? defaultSettings;
}

export async function getAllPosts() {
  const settings = await getBlogSettings();
  const entries = await reader.collections.posts.all({ resolveLinkedFiles: true });

  return sortNewestFirst(
    entries
      .map(({ slug, entry }) => ({
        ...entry,
        slug,
        author: entry.author || settings.defaultAuthor,
      }))
      .filter((entry) => !entry.draft)
  );
}

export async function getPostBySlug(slug: string) {
  const settings = await getBlogSettings();
  const entry = await reader.collections.posts.read(slug, { resolveLinkedFiles: true });

  if (!entry || entry.draft) return null;

  return {
    ...entry,
    slug,
    author: entry.author || settings.defaultAuthor,
  };
}
