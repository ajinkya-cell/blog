export const calloutQuoteGroqProjection = /* groq */ `
  _type == "calloutQuote" => {
    ...,
    quote,
    author,
    source,
    sourceUrl
  }
`;
