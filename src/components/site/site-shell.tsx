import type { CSSProperties, ReactNode } from "react";

import { getSiteContext } from "@/lib/data/site";
import { fontPresetStyle } from "@/lib/fonts";
import { getTemplate } from "@/templates/registry";

/**
 * Applies the photographer's theme (colours, fonts) and wraps content in the
 * active template's layout. Shared by the site layout and the 404 page.
 */
export async function SiteShell({ children }: { children: ReactNode }) {
  const site = await getSiteContext();
  const { settings } = site;
  const { Layout } = getTemplate(settings.template);

  const style = {
    ...fontPresetStyle(settings.font_preset),
    "--brand-primary": settings.primary_color,
    "--brand-secondary": settings.secondary_color,
  } as CSSProperties;

  return (
    <div className="site min-h-svh" style={style} data-template={settings.template}>
      <Layout site={site}>{children}</Layout>
    </div>
  );
}
