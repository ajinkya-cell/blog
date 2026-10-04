import { Quote } from "lucide-react";
import { defineField, defineType } from "sanity";

export const calloutQuoteSchema = defineType({
  name: "calloutQuote",
  type: "object",
  title: "Callout Quote",
  description:
    "A prominent pull quote, aphorism, or notable passage with optional citation.",
  icon: Quote,
  fields: [
    defineField({
      name: "quote",
      type: "text",
      title: "Quote",
      description: "The text of the quote or reflection",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      type: "string",
      title: "Author / Speaker",
      description: "Who said or wrote this (e.g. 'Alan Kay', or leave blank if yourself)",
    }),
    defineField({
      name: "source",
      type: "string",
      title: "Source / Context",
      description: "Where it comes from (e.g. 'The Design of Everyday Things')",
    }),
    defineField({
      name: "sourceUrl",
      type: "url",
      title: "Source Link",
      description: "Optional URL to the original work or book",
    }),
  ],
  preview: {
    select: {
      title: "quote",
      subtitle: "author",
    },
    prepare: ({ title, subtitle }) => ({
      title: title ? `“${title.slice(0, 50)}…”` : "Quote",
      subtitle: subtitle || "Callout quote",
    }),
  },
});
