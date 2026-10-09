import { User } from "lucide-react";
import { defineField, defineType } from "sanity";

import { imageWithAltField } from "@/schemaTypes/common";

export const author = defineType({
  name: "author",
  type: "document",
  title: "Author Profile",
  description:
    "Personal author profile, bio, avatar, and social links for the site author",
  icon: User,
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Name",
      description: "The full name of the person who wrote the content",
      validation: (Rule) => Rule.required().error("Author name is required"),
    }),
    defineField({
      name: "position",
      type: "string",
      title: "Position",
      description:
        "The job title or role of this person, like 'Editor' or 'Writer'",
    }),
    imageWithAltField({
      title: "Image",
      description:
        "A photo of the author that will appear next to their articles",
    }),
    defineField({
      name: "tagline",
      type: "string",
      title: "Tagline",
      description:
        "A short one-line statement (e.g. 'Software engineer & writer')",
    }),
    defineField({
      name: "location",
      type: "string",
      title: "Location",
      description: "Where you are based (e.g. 'San Francisco, CA')",
    }),
    defineField({
      name: "status",
      type: "string",
      title: "Status / Currently",
      description: "Current focus (e.g. 'Building open web experiences')",
    }),
    defineField({
      name: "bio",
      type: "text",
      title: "Bio",
      description:
        "A short paragraph about the author's background and expertise",
      rows: 3,
    }),
    defineField({
      name: "socialLinks",
      type: "object",
      title: "Social Links",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "github",
          type: "url",
          title: "GitHub Profile URL",
        }),
        defineField({
          name: "twitter",
          type: "url",
          title: "Twitter / X Profile URL",
        }),
        defineField({
          name: "bluesky",
          type: "url",
          title: "Bluesky Profile URL",
        }),
        defineField({
          name: "linkedin",
          type: "url",
          title: "LinkedIn Profile URL",
        }),
        defineField({
          name: "website",
          type: "url",
          title: "Personal Website URL",
        }),
        defineField({
          name: "email",
          type: "string",
          title: "Email Address",
          validation: (rule) => rule.email(),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      position: "position",
      media: "image",
      bio: "bio",
    },
    prepare: ({ title, position, media, bio }) => {
      const positionInfo = position ? `💼 ${position}` : "🎭 Mystery Writer";
      return {
        title: `✍️ ${title || "Unnamed Author"}`,
        subtitle: `${positionInfo} | ${bio}`,
        media,
      };
    },
  },
});
