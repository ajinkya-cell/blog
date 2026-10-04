import { imageFields } from "../internal/groq-fragments";

export const projectShowcaseGroqProjection = /* groq */ `
  _type == "projectShowcase" => {
    ...,
    items[]{
      ...,
      _key,
      title,
      description,
      category,
      year,
      status,
      tags,
      githubUrl,
      liveUrl,
      featured,
      "image": image {
        ${imageFields}
      }
    }
  }
`;
