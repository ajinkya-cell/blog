import {
  buttonsFragment,
  imageFields,
  markDefsFragment,
} from "../internal/groq-fragments";

export const personalHeroGroqProjection = /* groq */ `
  _type == "personalHero" => {
    ...,
    "avatar": avatar {
      ${imageFields}
    },
    bio[]{
      ...,
      _type == "block" => {
        ...,
        ${markDefsFragment}
      }
    },
    ${buttonsFragment}
  }
`;
