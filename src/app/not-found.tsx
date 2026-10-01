import { SiteShell } from "@/components/site/site-shell";
import { getSiteContext } from "@/lib/data/site";
import { getTemplate } from "@/templates/registry";

export default async function NotFound() {
  const site = await getSiteContext();
  const { NotFoundPage } = getTemplate(site.settings.template);
  return (
    <SiteShell>
      <NotFoundPage site={site} />
    </SiteShell>
  );
}
