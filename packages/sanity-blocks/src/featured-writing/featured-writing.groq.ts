import { imageFields } from "../internal/groq-fragments";

export const featuredWritingGroqProjection = /* groq */ `
  _type == "featuredWriting" => {
    ...,
    posts[]->{
      _id,
      _type,
      title,
      description,
      "slug": slug.current,
      publishedAt,
      category,
      readTime,
      "image": image {
        ${imageFields}
      },
      authors[0]->{
        name,
        "avatar": image {
          ${imageFields}
        }
      }
    }
  }
`;
