import { imageWithAltField } from "@workspace/sanity-blocks/internal/schema-fields";
import { FolderGit2 } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

const projectShowcaseItem = defineArrayMember({
  name: "projectItem",
  type: "object",
  title: "Project Item",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Project Title",
      description: "Name of the project or tool",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "Brief summary of what this project does and key tech used",
      rows: 2,
    }),
    defineField({
      name: "category",
      type: "string",
      title: "Category",
      description: "E.g. 'Open Source', 'Web App', 'CLI Tool', 'Design System'",
    }),
    defineField({
      name: "year",
      type: "string",
      title: "Year",
      description: "Year created or released (e.g. '2026')",
    }),
    defineField({
      name: "status",
      type: "string",
      title: "Status",
      description: "Current state of the project",
      options: {
        list: [
          { title: "Active / Maintained", value: "active" },
          { title: "Shipped", value: "shipped" },
          { title: "In Progress / WIP", value: "wip" },
          { title: "Archived", value: "archived" },
        ],
      },
      initialValue: "active",
    }),
    defineField({
      name: "tags",
      type: "array",
      title: "Tech Stack / Tags",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "githubUrl",
      type: "url",
      title: "GitHub URL",
    }),
    defineField({
      name: "liveUrl",
      type: "url",
      title: "Live URL / Demo",
    }),
    imageWithAltField({
      title: "Preview Screenshot",
      description: "Optional screenshot or thumbnail",
    }),
    defineField({
      name: "featured",
      type: "boolean",
      title: "Featured",
      description: "Highlight as a larger card in the grid",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "image",
    },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "Untitled Project",
      subtitle: subtitle || "Project",
      media,
    }),
  },
});

export const projectShowcaseSchema = defineType({
  name: "projectShowcase",
  type: "object",
  title: "Project Showcase",
  description:
    "A clean showcase of your personal projects, open-source repositories, experiments, and tools.",
  icon: FolderGit2,
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      title: "Eyebrow",
      description: "Small label shown above the title (e.g. 'Craft & Code')",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "Section heading (e.g. 'Featured Projects')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "Supporting text for the section",
      rows: 2,
    }),
    defineField({
      name: "items",
      type: "array",
      title: "Projects",
      description: "Add projects to display in this section",
      of: [projectShowcaseItem],
    }),
    defineField({
      name: "viewAllHref",
      type: "string",
      title: "View All Projects Link",
      description: "Optional URL to full projects archive (e.g. '/projects')",
      initialValue: "/projects",
    }),
  ],
  preview: {
    select: {
      title: "title",
      items: "items",
    },
    prepare: ({ title, items = [] }) => ({
      title: title || "Project Showcase",
      subtitle: `${items.length} project${items.length === 1 ? "" : "s"}`,
    }),
  },
});
