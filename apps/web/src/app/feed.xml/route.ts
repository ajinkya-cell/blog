import { sanityFetch } from "@workspace/sanity/live";
import { queryRssFeedData, querySettingsData } from "@workspace/sanity/query";
import { getBaseUrl } from "@/utils";

async function generateRssFeedXml() {
  "use cache";
  const baseUrl = getBaseUrl();

  const [{ data: posts }, { data: settings }] = await Promise.all([
    sanityFetch({
      query: queryRssFeedData,
      perspective: "published",
      stega: false,
    }),
    sanityFetch({
      query: querySettingsData,
      perspective: "published",
      stega: false,
    }),
  ]);

  const siteTitle = settings?.siteTitle ?? "Personal Blog";
  const siteDescription =
    settings?.siteDescription ?? "Essays, notes, and technical articles.";

  const itemsXml = (posts ?? [])
    .map((post) => {
      const postUrl = `${baseUrl}${post.slug}`;
      const pubDate = new Date(
        post.publishedAt || post._createdAt
      ).toUTCString();
      const authorName = post.authors?.name ?? siteTitle;

      return `    <item>
      <title><![CDATA[${post.title ?? "Untitled"}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.description ?? ""}]]></description>
      <author><![CDATA[${authorName}]]></author>
      ${post.category ? `<category><![CDATA[${post.category}]]></category>` : ""}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteTitle}]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[${siteDescription}]]></description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;
}

export async function GET() {
  const rssFeed = await generateRssFeedXml();

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
