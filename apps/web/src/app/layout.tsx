import "@workspace/ui/globals.css";
import "katex/dist/katex.min.css";

import { Analytics } from "@vercel/analytics/next";
import {
  type DynamicFetchOptions,
  getDynamicFetchOptions,
  SanityLive,
} from "@workspace/sanity/live";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import { preconnect, prefetchDNS } from "react-dom";

import { revalidateSyncTags } from "@/app/actions/revalidate";
import { CachedFooter, DynamicFooter } from "@/components/footer";
import { CombinedJsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { PreviewBar } from "@/components/preview-bar";
import { Providers } from "@/components/providers";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ScrollWater } from "@/components/scroll-water";
import { VisualEditingLayer } from "@/components/visual-editing-layer";
import { getNavigationData } from "@/lib/navigation";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fontInstrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preconnect("https://cdn.sanity.io");
  prefetchDNS("https://cdn.sanity.io");
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontInstrumentSerif.variable} font-sans antialiased`}
      >
        {/* LQIP placeholder fallback */}
        <noscript>
          <style>{`
            img[data-lqip] { display: none !important; }
          `}</style>
        </noscript>
        <Providers>
          <ScrollToTop />
          <ScrollWater />
          <div className="relative flex min-h-dvh flex-col bg-background">
            {/* Session-gated, not environment-gated, so the deployed Studio can
                edit the nav; the published fallback keeps real content in the
                static shell. */}
            <Suspense fallback={<PublishedNavbar />}>
              <DynamicNavbar />
            </Suspense>
            <main className="flex-1 pt-20 sm:pt-24">{children}</main>
            <Suspense
              fallback={<CachedFooter perspective="published" stega={false} />}
            >
              <DynamicFooter />
            </Suspense>
          </div>
          {/* Reads draftMode(), so it must stay behind Suspense — otherwise the
              whole layout opts out of prerendering for every visitor. */}
          <Suspense fallback={null}>
            <LivePreviewLayer />
          </Suspense>
          <Suspense fallback={null}>
            <CombinedJsonLd includeOrganization includeWebsite />
          </Suspense>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

/**
 * Live updates plus the Presentation overlay. The overlay renders wherever a
 * validated draft-mode session exists — production included — which is what
 * lets the deployed Studio preview the live site.
 */
async function LivePreviewLayer() {
  const { isEnabled: isDraftMode } = await draftMode();
  const { perspective } = await getDynamicFetchOptions();
  return (
    <>
      <SanityLive action={revalidateSyncTags} includeDrafts={isDraftMode} />
      {isDraftMode && (
        <>
          <PreviewBar />
          <VisualEditingLayer inlineEditing={perspective === "drafts"} />
        </>
      )}
    </>
  );
}

async function DynamicNavbar() {
  const { perspective, stega } = await getDynamicFetchOptions();
  return <CachedNavbar perspective={perspective} stega={stega} />;
}

/** Static shell for the nav. A Suspense fallback renders in the parent, so it
 * may only await cached data — `getGithubStars` memoizes at runtime, so the
 * count arrives with DynamicNavbar instead. */
async function PublishedNavbar() {
  const { navbarData, settingsData } = await getNavigationData({
    perspective: "published",
    stega: false,
  });
  return <Navbar navbarData={navbarData} settingsData={settingsData} />;
}

async function CachedNavbar({ perspective, stega }: DynamicFetchOptions) {
  const { navbarData, settingsData } = await getNavigationData({
    perspective,
    stega,
  });

  return <Navbar navbarData={navbarData} settingsData={settingsData} />;
}
