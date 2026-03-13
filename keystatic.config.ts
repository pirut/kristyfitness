import { collection, config, fields, singleton } from "@keystatic/core";

const isLocal = process.env.NODE_ENV === "development";

export default config({
  storage: isLocal
    ? { kind: "local" }
    : {
        kind: "github",
        repo: "pirut/kristyfitness",
      },
  ui: {
    brand: {
      name: "Kingdom Health Journal",
    },
    navigation: {
      Content: ["posts", "---", "blogSettings"],
    },
  },
  collections: {
    posts: collection({
      label: "Blog posts",
      path: "src/content/blog/*/",
      slugField: "slug",
      entryLayout: "content",
      format: {
        data: "yaml",
        contentField: "body",
      },
      columns: ["title", "publishDate", "draft"],
      schema: {
        title: fields.text({
          label: "Title",
          validation: { isRequired: true, length: { min: 8, max: 120 } },
        }),
        slug: fields.text({
          label: "Slug",
          description: "Used in the post URL, for example /blog/your-slug.",
          validation: {
            isRequired: true,
            pattern: {
              regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: "Use lowercase letters, numbers, and hyphens only.",
            },
          },
        }),
        publishDate: fields.date({
          label: "Publish date",
          validation: { isRequired: true },
        }),
        updatedDate: fields.date({
          label: "Updated date",
          description: "Optional. Set this when you revise a published post.",
        }),
        excerpt: fields.text({
          label: "Excerpt",
          multiline: true,
          validation: { isRequired: true, length: { min: 30, max: 220 } },
        }),
        coverImage: fields.image({
          label: "Cover image",
          directory: "public/blog/covers",
          publicPath: "/blog/covers/",
        }),
        tags: fields.array(
          fields.text({
            label: "Tag",
            validation: { isRequired: true, length: { min: 2, max: 24 } },
          }),
          {
            label: "Tags",
            itemLabel: (props) => props.value || "Tag",
          }
        ),
        author: fields.text({
          label: "Author",
          defaultValue: "Kristy",
          validation: { isRequired: true, length: { min: 2, max: 60 } },
        }),
        draft: fields.checkbox({
          label: "Draft",
          defaultValue: true,
          description: "Draft posts stay hidden from the live site and RSS feed.",
        }),
        seoTitle: fields.text({
          label: "SEO title",
          description: "Optional. Falls back to the main title if left blank.",
          validation: { length: { max: 70 } },
        }),
        seoDescription: fields.text({
          label: "SEO description",
          multiline: true,
          description: "Optional. Falls back to the excerpt if left blank.",
          validation: { length: { max: 170 } },
        }),
        body: fields.document({
          label: "Post body",
          formatting: true,
          links: true,
          dividers: true,
          layouts: [
            [1, 1],
            [2, 1],
            [1, 2],
          ],
          images: {
            directory: "public/blog/inline",
            publicPath: "/blog/inline/",
          },
          tables: true,
        }),
      },
    }),
  },
  singletons: {
    blogSettings: singleton({
      label: "Blog settings",
      path: "src/content/settings/blog",
      schema: {
        introEyebrow: fields.text({
          label: "Intro eyebrow",
          defaultValue: "The Kingdom Health Journal",
          validation: { isRequired: true, length: { min: 4, max: 80 } },
        }),
        introTitle: fields.text({
          label: "Intro title",
          defaultValue: "Biblical encouragement for health, stewardship, and steady restoration.",
          validation: { isRequired: true, length: { min: 12, max: 120 } },
        }),
        introText: fields.text({
          label: "Intro text",
          multiline: true,
          defaultValue:
            "This journal gives Kingdom Health a place to teach, encourage, and answer common questions in a slower, more thoughtful format.",
          validation: { isRequired: true, length: { min: 40, max: 320 } },
        }),
        defaultAuthor: fields.text({
          label: "Default author name",
          defaultValue: "Kristy",
          validation: { isRequired: true, length: { min: 2, max: 60 } },
        }),
        emptyStateMessage: fields.text({
          label: "Empty state message",
          defaultValue: "Fresh articles will appear here soon.",
          validation: { isRequired: true, length: { min: 8, max: 140 } },
        }),
      },
    }),
  },
});
