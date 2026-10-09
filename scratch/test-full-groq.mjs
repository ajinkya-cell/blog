import fs from "fs";

const projectId = "a2vuctp3";
const dataset = "production";
const token = "sk5FLqfyLXMqoXkPQjssQuTjWwJwvBMiqFqZIYv8lIkwsJzbIARNL8vlmmS4wByGwzFL8YbRpSemSO0o9CNj4PrPWM8DgKoYBh8HTqMN0mPxj5gMDcKgMgPFYpSvZNxwWQKwEM045VxkNjcThVwBA8yyeU1paDCK40BRt7nkrGSIrfnVbjZt";

// Let's assemble the exact query from packages/sanity/src/query.ts
const imageFields = `
  "id": asset._ref,
  "preview": asset->metadata.lqip,
  "alt": coalesce(
    alt,
    asset->altText,
    caption,
    asset->originalFilename,
    "untitled"
  ),
  hotspot {
    x,
    y
  },
  crop {
    bottom,
    left,
    right,
    top
  }
`;

const imageFragment = `
  image {
    ${imageFields}
  }
`;

const customLinkFragment = `
  ...customLink{
    openInNewTab,
    "href": select(
      type == "internal" => internal->slug.current,
      type == "external" => external,
      "#"
    ),
  }
`;

const markDefsFragment = `
  markDefs[]{
    ...,
    ${customLinkFragment}
  }
`;

const richTextFragment = `
  richText[]{
    ...,
    _type == "block" => {
      ...,
      ${markDefsFragment}
    },
    _type == "image" => {
      ${imageFields},
      "caption": caption
    },
    _type == "callout" => {
      ...,
      content[]{
        ...,
        _type == "block" => {
          ...,
          ${markDefsFragment}
        }
      }
    },
    _type == "divider" => {
      style
    },
    _type == "pullQuote" => {
      text,
      attribution
    },
    _type == "videoEmbed" => {
      url,
      caption,
      autoPlay
    },
    _type == "tweetEmbed" => {
      url,
      caption
    },
    _type == "fileDownload" => {
      "url": file.asset->url,
      "originalFilename": file.asset->originalFilename,
      "size": file.asset->size,
      "extension": file.asset->extension,
      label,
      description
    },
    _type == "mathBlock" => {
      latex,
      caption
    },
    _type == "expandable" => {
      summary,
      content[]{
        ...,
        _type == "block" => {
          ...,
          ${markDefsFragment}
        }
      },
      defaultOpen
    },
    _type == "codeGroup" => {
      title,
      files[]{
        _key,
        filename,
        language,
        code,
        highlightLines
      }
    },
    _type == "playgroundEmbed" => {
      url,
      title,
      provider,
      height
    },
    _type == "table" => {
      ...,
      rows[]{
        ...,
        cells[]{
          ...,
          value[]{
            ...,
            _type == "block" => {
              ...,
              ${markDefsFragment}
            }
          }
        }
      }
    }
  }
`;

const blogAuthorFragment = `
  "authors": *[_type == "author" && (_id in ["author", "author-ajinkya"])][0]{
    _id,
    name,
    position,
    tagline,
    location,
    status,
    bio,
    socialLinks,
    ${imageFragment}
  }
`;

const blogCardFragment = `
  _type,
  _id,
  title,
  description,
  "slug":slug.current,
  orderRank,
  category,
  tags,
  readTime,
  ${imageFragment},
  publishedAt,
  ${blogAuthorFragment}
`;

// Also pageBuilderFragment imports
const pageBuilderFragment = `pageBuilder[]{ ... }`;

const fullQuery = `
  *[_type == "blog" && slug.current == $slug][0]{
    ...,
    "slug": slug.current,
    ogTitle,
    "ogImage": seoImage.asset->url + "?w=1200&h=630&fit=crop&fm=jpg&q=80",
    orderRank,
    tags,
    readTime,
    series,
    showTableOfContents,
    relatedPosts[]->{
      ${blogCardFragment}
    },
    ${blogAuthorFragment},
    ${imageFragment},
    ${richTextFragment}
  }
`;

async function main() {
  const slug = "/blog/the-architecture-of-long-lived-software";
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(fullQuery)}&$slug=${encodeURIComponent(JSON.stringify(slug))}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log("Full query error:", data.error);
  console.log("Full query result found:", !!data.result);
}

main().catch(console.error);
