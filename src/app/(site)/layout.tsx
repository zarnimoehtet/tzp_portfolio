import type { Metadata } from "next";

import { SiteShell } from "@/components/site/site-shell";
import { getSiteContext } from "@/lib/data/site";
import { defaultDescription } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteContext();
  const { settings, about } = site;
  const name = about.name;

  return {
    title: { default: settings.seo_title || name, template: `%s — ${name}` },
    description: defaultDescription(site),
    applicationName: name,
    authors: [{ name }],
    creator: name,
    icons: settings.favicon
      ? {
          icon: [
            { url: settings.favicon.thumbnail_url, sizes: "48x48", type: "image/png" },
            { url: settings.favicon.medium_url, sizes: "192x192", type: "image/png" },
          ],
          apple: settings.favicon.medium_url,
        }
      : undefined,
    openGraph: { siteName: name, locale: "en_US", type: "website" },
    robots: { index: true, follow: true },
  };
}

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <SiteShell>{children}</SiteShell>;
}
