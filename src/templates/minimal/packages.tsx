import type { PackagesPageProps } from "@/templates/types";
import { ContactCta, Container, EmptyState, PackageCard, PageIntro } from "./components";

export function MinimalPackagesPage({ site, packages }: PackagesPageProps) {
  return (
    <>
      <PageIntro label="Packages" title="Investment that fits.">
        Every collection includes thoughtful planning, a calm presence on the day, and carefully
        hand-edited photographs. Custom packages are always welcome.
      </PageIntro>
      <Container className="pb-20 md:pb-28">
        {packages.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <EmptyState>Packages will be published soon. Get in touch for a quote.</EmptyState>
        )}
      </Container>
      <ContactCta
        title="Have something different in mind?"
        subtitle="Tell me about your vision — custom packages are welcome."
        availability={site.contact.availability}
      />
    </>
  );
}
