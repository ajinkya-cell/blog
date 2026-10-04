import {
  buttonsField,
  definePortableTextField,
  imageWithAltField,
} from "@workspace/sanity-blocks/internal/schema-fields";
import { User } from "lucide-react";
import { defineField, defineType } from "sanity";

export const personalHeroSchema = defineType({
  name: "personalHero",
  type: "object",
  title: "Personal Hero",
  description:
    "An intimate personal introduction with avatar, name, tagline, current activity status, bio, and social links.",
  icon: User,
  fields: [
    defineField({
      name: "statusPill",
      type: "string",
      title: "Status Pill",
      description:
        "Optional current status or focus indicator (e.g. '🟢 Writing about systems & design', 'Building in public')",
    }),
    defineField({
      name: "greeting",
      type: "string",
      title: "Greeting / Headline",
      description: "Primary headline (e.g. 'Hey, I’m Alex Chen')",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      type: "string",
      title: "Tagline / Role",
      description:
        "Brief subheadline (e.g. 'Software engineer, designer, and writer')",
    }),
    imageWithAltField({
      name: "avatar",
      title: "Avatar / Portrait",
      description: "A photo or illustration of yourself",
    }),
    definePortableTextField(["block"], {
      name: "bio",
      title: "Short Bio",
      description:
        "A welcoming paragraph introducing who you are, what you explore, and what visitors will find here",
    }),
    buttonsField,
  ],
  preview: {
    select: {
      title: "greeting",
      subtitle: "tagline",
      media: "avatar",
    },
    prepare: ({ title, subtitle, media }) => ({
      title: title || "Personal Hero",
      subtitle: subtitle || "Personal introduction",
      media,
    }),
  },
});
