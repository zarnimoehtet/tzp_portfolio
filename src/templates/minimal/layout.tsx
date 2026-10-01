import type { TemplateLayoutProps } from "@/templates/types";
import { Footer } from "./footer";
import { Header } from "./header";

export function MinimalLayout({ site, children }: TemplateLayoutProps) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-4 py-3 text-sm text-paper focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Header name={site.about.name} logo={site.settings.logo} />
      <main id="main">{children}</main>
      <Footer site={site} />
    </>
  );
}
