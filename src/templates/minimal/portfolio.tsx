import type { PortfolioPageProps } from "@/templates/types";
import { AlbumFilter } from "./album-filter";
import { ContactCta, Container, EmptyState, PageIntro } from "./components";

export function MinimalPortfolioPage({ site, albums }: PortfolioPageProps) {
  return (
    <>
      <PageIntro label="Portfolio" title="Stories through the lens.">
        Choose a chapter — each album opens as a curated invitation into the day.
      </PageIntro>
      <Container className="pb-20 md:pb-28">
        {albums.length > 0 ? (
          <AlbumFilter albums={albums} />
        ) : (
          <EmptyState>New stories are coming soon.</EmptyState>
        )}
      </Container>
      <ContactCta availability={site.contact.availability} />
    </>
  );
}
