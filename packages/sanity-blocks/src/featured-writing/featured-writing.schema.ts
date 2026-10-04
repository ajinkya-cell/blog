import { Sparkles } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

export const featuredWritingSchema = defineType({
  name: "featuredWriting",
  type: "object",
  title: "Featured Writing",
  description:
    "A curated editorial list of your best or most popular essays and blog posts.",
  icon: Sparkles,
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      title: "Eyebrow",
      description: "Small uppercase label above the title (e.g. 'Writing')",
      initialValue: "Writing",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Section headline (e.g. 'Selected Essays')",
      validation: (Rule) => Rule.required(),
      initialValue: "Selected Essays",
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "Brief summary introducing the themes you explore",
      rows: 2,
    }),
    defineField({
      name: "posts",
      type: "array",
      title: "Curated Posts",
      description: "Select specific blog posts to highlight",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "blog" }],
        }),
      ],
      validation: (Rule) => Rule.min(1).error("Select at least one post"),
    }),
    defineField({
      name: "viewAllHref",
      type: "string",
      title: "View All Link",
      description: "Link to full writing archive",
      initialValue: "/blog",
    }),
  ],
  preview: {
    select: {
      title: "title",
      posts: "posts",
    },
    prepare: ({ title, posts = [] }) => ({
      title: title || "Featured Writing",
      subtitle: `${posts.length} selected post${posts.length === 1 ? "" : "s"}`,
    }),
  },
});
