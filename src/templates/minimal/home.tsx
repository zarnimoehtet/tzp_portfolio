import Link from "next/link";

import { ResponsiveImage } from "@/components/site/responsive-image";
import { cn } from "@/lib/utils";
import type { HomePageProps } from "@/templates/types";
import {
  AlbumCard,
  ContactCta,
  Container,
  PackageCard,
  PillLink,
  SectionHeading,
} from "./components";
import { PhotoSlider } from "./photo-slider";

function Hero({ site, fallbackImage }: Pick<HomePageProps, "site"> & {
  fallbackImage: HomePageProps["selectedWork"][number]["image"] | undefined;
}) {
  const { settings } = site;
  const image = settings.hero_image ?? fallbackImage;
  const title = settings.hero_title.trim();

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#0e0e0e] text-white">
      {image ? (
        <ResponsiveImage
          image={image}
          alt=""
          sizes="100vw"
          fill
          priority
          className="hero-image -z-20"
        />
      ) : (
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/25 to-black/65"
      />

      <Container className="flex max-w-[1400px] flex-1 flex-col justify-center pt-24 pb-24 md:pt-32 md:pb-28">
        <h1
          className={cn(
            "fade-up max-w-[14ch] font-display leading-[0.95] tracking-[-0.03em] whitespace-pre-line text-balance",
            title.length <= 32
              ? "text-[clamp(2.75rem,11vw,9.5rem)]"
              : "text-[clamp(2.25rem,7vw,6rem)] max-w-[20ch]",
          )}
        >
          {title}
        </h1>
        {settings.hero_subtitle && (
          <p className="fade-up mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-white/85 [animation-delay:150ms] md:mt-8 md:text-lg">
            {settings.hero_subtitle}
          </p>
        )}
        <div className="fade-up mt-7 [animation-delay:300ms] md:mt-10">
          <Link
            href="/contact"
            className="inline-flex items-center bg-white px-5 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 md:px-6 md:py-3.5"
          >
            Work with me
          </Link>
        </div>
      </Container>

      <a
        href="#featured"
        className="eyebrow absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5 text-white/60 transition-colors hover:text-white md:bottom-7 md:gap-3"
      >
        Scroll
        <span aria-hidden className="h-6 w-px bg-current md:h-8" />
      </a>
    </section>
  );
}

function FeaturedSlider({ photos }: { photos: HomePageProps["selectedWork"] }) {
  if (photos.length === 0) return null;

  return (
    <section
      id="featured"
      aria-label="Featured photographs"
      className="relative isolate overflow-hidden bg-[#0e0e0e] py-14 text-white md:py-28"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_40%,rgba(40,70,80,0.45),transparent_65%)]"
      />
      <PhotoSlider photos={photos} />
    </section>
  );
}

function Albums({ albums }: { albums: HomePageProps["featuredAlbums"] }) {
  if (albums.length === 0) return null;

  return (
    <section className="py-14 md:py-28">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
          <SectionHeading
            label="Albums"
            title="Stories through the lens."
            description="A curated collection of projects showcasing emotion, atmosphere, and visual storytelling."
          />
          <PillLink href="/portfolio" variant="outline" className="shrink-0 self-start md:self-auto">
            View All Albums
          </PillLink>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-2.5 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:mt-12 md:gap-x-8 md:gap-y-12">
          {albums.slice(0, 4).map((album, i) => (
            <div key={album.id} className="reveal">
              <AlbumCard
                album={album}
                index={i}
                sizes="(min-width: 768px) 40vw, 48vw"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Packages({ packages }: { packages: HomePageProps["packages"] }) {
  if (packages.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            label="Packages"
            title="Investment that fits."
            description="Thoughtful collections for every kind of story — custom options welcome."
          />
          <PillLink href="/packages" variant="outline" className="shrink-0 self-start md:self-auto">
            All Packages
          </PillLink>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {packages.slice(0, 3).map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export function MinimalHomePage({ site, featuredAlbums, selectedWork, packages }: HomePageProps) {
  const ctaImages = selectedWork.slice(0, 4).map((p) => ({
    url: p.image.thumbnail_url,
    alt: p.alt,
  }));

  return (
    <>
      <Hero site={site} fallbackImage={selectedWork[0]?.image} />
      <FeaturedSlider photos={selectedWork} />
      <Albums albums={featuredAlbums} />
      <Packages packages={packages} />
      <ContactCta
        availability={site.contact.availability}
        images={ctaImages.length > 0 ? ctaImages : undefined}
      />
    </>
  );
}
