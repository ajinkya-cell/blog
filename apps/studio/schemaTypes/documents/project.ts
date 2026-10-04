import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { FolderGit2 } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

import { documentSlugField, imageWithAltField } from "@/schemaTypes/common";
import { GROUP, GROUPS } from "@/utils/constant";
import { ogFields } from "@/utils/og-fields";
import { seoFields } from "@/utils/seo-fields";

export const project = defineType({
  name: "project",
  type: "document",
  title: "Project",
  description:
    "A showcase of your personal projects, open-source work, tools, and creations.",
  icon: FolderGit2,
  groups: GROUPS,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "project" }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The name of your project or product",
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required().error("A project title is required"),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "A short summary of what this project does and why you built it",
      rows: 3,
      group: GROUP.MAIN_CONTENT,
      validation: (Rule) => Rule.required().error("A description is required"),
    }),
    documentSlugField("projects", {
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "year",
      type: "string",
      title: "Year",
      description: "The year the project was released or built (e.g. '2026')",
      initialValue: () => new Date().getFullYear().toString(),
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "status",
      type: "string",
      title: "Status",
      description: "Current stage of the project",
      initialValue: "active",
      options: {
        list: [
          { title: "Active / Maintained", value: "active" },
          { title: "Shipped", value: "shipped" },
          { title: "In Progress / WIP", value: "wip" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "category",
      type: "string",
      title: "Category",
      description:
        "The category of this work (e.g. 'Open Source', 'Web App', 'Developer Tool', 'Creative Tech')",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "techStack",
      type: "array",
      title: "Tech Stack / Tags",
      description: "Technologies, frameworks, or topics used in this project",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
      },
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "githubUrl",
      type: "url",
      title: "GitHub Repository URL",
      description: "Link to the GitHub source code",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "liveUrl",
      type: "url",
      title: "Live URL / Demo",
      description: "Link to the live demo or website",
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: "featured",
      type: "boolean",
      title: "Featured Project",
      description: "Highlight this project on the homepage and at the top of the projects showcase",
      initialValue: false,
      group: GROUP.MAIN_CONTENT,
    }),
    imageWithAltField({
      title: "Screenshot / Cover Image",
      description: "Preview screenshot or thumbnail graphic for this project",
      group: GROUP.MAIN_CONTENT,
    }),
    ...seoFields,
    ...ogFields,
  ],
  preview: {
    select: {
      title: "title",
      status: "status",
      year: "year",
      media: "image",
      featured: "featured",
    },
    prepare: ({ title, status, year, media, featured }) => {
      const featuredBadge = featured ? "⭐ " : "";
      const yearInfo = year ? ` (${year})` : "";
      return {
        title: `${featuredBadge}${title || "Untitled Project"}${yearInfo}`,
        subtitle: `Status: ${status || "active"}`,
        media,
      };
    },
  },
});
