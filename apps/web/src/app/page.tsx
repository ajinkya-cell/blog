import {
  getDynamicFetchOptions,
  sanityFetch,
  sanityFetchMetadata,
} from "@workspace/sanity/live";
import {
  queryHomePageData,
  queryRecentThreeBlogs,
} from "@workspace/sanity/query";
import type { Metadata } from "next";

import { MatrixRippleBackground } from "@/components/matrix-ripple-background";
import { StackedBlogPreview } from "@/components/stacked-blog-preview";
import { seoFromDocument } from "@/lib/seo";
import type { Blog } from "@/types";

export async function generateMetadata(): Promise<Metadata> {
  const { perspective } = await getDynamicFetchOptions();
  const { data: homePageData } = await sanityFetchMetadata({
    query: queryHomePageData,
    perspective,
  });
  return seoFromDocument(homePageData, { slug: "/" });
}

async function getRecentBlogs() {
  "use cache";
  const { data } = await sanityFetch({
    query: queryRecentThreeBlogs,
    perspective: "published",
    stega: false,
  });
  return data;
}

export default async function HomePage() {
  const recentBlogs = await getRecentBlogs();

  return (
    <div className="relative w-full overflow-hidden">
      {/* Interactive Matrix Character Ripple Canvas */}
      <MatrixRippleBackground />

      {/* Headline higher up + 3-card scroll-driven fan-out animation */}
      <StackedBlogPreview blogs={(recentBlogs as unknown as Blog[]) ?? []} />
    </div>
  );
}
