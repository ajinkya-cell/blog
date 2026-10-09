import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { BLOG_CATEGORY_OPTIONS } from "@workspace/sanity-blocks/internal/blog-categories";
import { FileText } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { documentSlugField, imageWithAltField } from "@/schemaTypes/common";
import { GROUP, GROUPS } from "@/utils/constant";
import { ogFields } from "@/utils/og-fields";
import { seoFields } from "@/utils/seo-fields";

export const blog = defineType({
  name: "blog",
  type: "document",
  title: "Blog",
  description:
    "A blog post that will be published on the website. Add a title, description, author, and content to create a new article for readers.",
  icon: FileText,
  groups: GROUPS,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "blog" }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The headline of your blog post that readers will see first",
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required().error("A blog title is required"),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description:
        "A short summary of what your blog post is about (appears in search results)",
      rows: 3,
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => [
        rule
          .min(140)
          .warning(
            "The meta description should be at least 140 characters for optimal SEO visibility in search results"
          ),
        rule
          .max(160)
          .warning(
            "The meta description should not exceed 160 characters as it will be truncated in search results"
          ),
      ],
    }),
    documentSlugField("blog", {
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "publishedAt",
      type: "date",
      title: "Published At",
      description:
        "The date when your blog post will appear to have been published",
      initialValue: () => new Date().toISOString().split("T")[0],
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "featured",
      type: "boolean",
      title: "Feature this post",
      description:
        "Show this post in a large highlighted card at the top of the blog listing page, marked “Featured”.",
      initialValue: false,
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "category",
      type: "string",
      title: "Category",
      description:
        "The topic this post belongs to. Used to group and filter posts in the sidebar on the blog listing page.",
      group: GROUP.MAIN_CONTENT,
      options: {
        list: BLOG_CATEGORY_OPTIONS,
        layout: "dropdown",
      },
    }),
    defineField({
      name: "readTime",
      type: "number",
      title: "Reading Time (Minutes)",
      description:
        "Estimated reading time in minutes. If omitted, it will be automatically calculated from word count.",
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => rule.min(1).max(120),
    }),
    defineField({
      name: "tags",
      type: "array",
      title: "Tags",
      description:
        "Keywords or topics for indexing and filtering (e.g. 'architecture', 'nextjs', 'reflection')",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
      },
      group: GROUP.MAIN_CONTENT,
    }),
    imageWithAltField({
      title: "Image",
      description:
        "The main picture that will appear at the top of your blog post and in previews",
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "richText",
      type: "richText",
      description:
        "The main content of your blog post with text, images, and formatting",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "series",
      type: "string",
      title: "Series (Optional)",
      description:
        "Name of the series this post belongs to (e.g. 'Engineering Fundamentals', 'Building in Public')",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "showTableOfContents",
      type: "boolean",
      title: "Show Table of Contents",
      description: "Display an outline / Table of Contents on this article",
      initialValue: true,
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "relatedPosts",
      type: "array",
      title: "Related Posts",
      description:
        "Up to 3 hand-picked posts to recommend at the end of this article",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "blog" }],
        }),
      ],
      validation: (rule) => rule.max(3),
      group: GROUP.MAIN_CONTENT,
    }),
    ...seoFields,
    ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      isPrivate: "seoNoIndex",
      isHidden: "seoHideFromLists",
      slug: "slug.current",
      category: "category",
      publishDate: "publishedAt",
    },
    prepare: ({
      title,
      media,
      isPrivate,
      isHidden,
      category,
      slug,
      publishDate,
    }) => {
      let visibility = "🌎 Public";
      if (isPrivate) {
        visibility = "🔒 Private";
      } else if (isHidden) {
        visibility = "🙈 Hidden";
      }

      const categoryInfo = category ? `🏷️ ${category}` : "";
      const dateInfo = publishDate
        ? `📅 ${new Date(publishDate).toLocaleDateString()}`
        : "⏳ Draft";

      return {
        title: title || "Untitled Blog",
        media,
        subtitle: [
          slug ? `🔗 ${slug}` : null,
          visibility,
          categoryInfo,
          dateInfo,
        ]
          .filter(Boolean)
          .join(" | "),
      };
    },
  },
});
