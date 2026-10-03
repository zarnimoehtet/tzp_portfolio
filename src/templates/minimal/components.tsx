import Link from "next/link";

import { ResponsiveImage } from "@/components/site/responsive-image";
import { formatDate, formatPrice } from "@/lib/format";
import type { AlbumWithCover, PackageWithFeatures, Testimonial } from "@/lib/types";
import { cn } from "@/lib/utils";

const DEFAULT_INVITE =
  "Together with our families, we invite you to celebrate this story.";

/** Renders "A & B" with a highlighted ampersand when present. */
function InvitationTitle({
  name,
  ampClassName,
}: {
  name: string;
  ampClassName: string;
}) {
  const parts = name.split(/\s*&\s*/);
  if (parts.length < 2) return <>{name}</>;
  return (
    <>
      {parts[0]}
      <span className={ampClassName}> &amp; </span>
      {parts.slice(1).join(" & ")}
    </>
  );
}

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-5 md:px-8", className)}>
      {children}
    </div>
  );
}

/** Shotline-style section label: small title + hairline rule. */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <p className="text-[0.8125rem] font-medium tracking-[-0.01em] text-muted-ink">{children}</p>
      <span aria-hidden className="h-px flex-1 bg-line" />
    </div>
  );
}

export function SectionHeading({
  label,
  title,
  description,
  action,
  className,
}: {
  label: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("reveal max-w-2xl", className)}>
      <SectionLabel>{label}</SectionLabel>
      <h2 className="mt-5 font-display text-[2rem] leading-[1.1] tracking-[-0.03em] text-balance md:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-muted-ink md:text-base">
          {description}
        </p>
      )}
      {action && (
        <Link href={action.href} className="pill-btn mt-8 inline-flex">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function PageIntro({
  label,
  title,
  children,
}: {
  label: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Container className="pt-32 pb-12 md:pt-40 md:pb-16">
      <SectionLabel className="fade-up">{label}</SectionLabel>
      <h1 className="fade-up mt-5 max-w-3xl font-display text-[2.75rem] leading-[1.05] tracking-[-0.035em] text-balance [animation-delay:100ms] md:text-6xl lg:text-7xl">
        {title}
      </h1>
      {children && (
        <div className="fade-up mt-5 max-w-xl text-base leading-relaxed text-muted-ink [animation-delay:200ms] md:text-lg">
          {children}
        </div>
      )}
    </Container>
  );
}

export function PillLink({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "pill-btn",
        variant === "outline" && "pill-btn-outline",
        variant === "ghost" && "pill-btn-ghost",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/80 px-3.5 py-1.5 text-xs font-medium text-ink backdrop-blur-sm">
      <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
      {label}
    </span>
  );
}

/**
 * Invitation-template album card: full preview layout inside a phone frame
 * (header → photo → names → date → quote → scroll), with the album title under it.
 */
export function AlbumCard({
  album,
  sizes,
  priority,
  variant = "auto",
  index = 0,
}: {
  album: AlbumWithCover;
  sizes: string;
  priority?: boolean;
  /** Force a look; default alternates by index. */
  variant?: "auto" | "light" | "dark";
  index?: number;
}) {
  const theme =
    variant === "auto" ? (index % 2 === 0 ? "light" : "dark") : variant;
  const isLight = theme === "light";
  const quote = album.description?.trim() || DEFAULT_INVITE;
  const dateLine = formatDate(album.created_at, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
  const accent = isLight ? "text-[#b8893d]" : "text-[#e0c07a]";
  const muted = isLight ? "text-[#6b5648]" : "text-white/70";
  const hairline = isLight ? "bg-[#c9a46a]/70" : "bg-white/35";

  return (
    <Link
      href={`/portfolio/${album.slug}`}
      className="album-card-enter group block"
      style={{ animationDelay: `${Math.min(index, 8) * 80}ms` }}
    >
      <article
        className={cn(
          "relative aspect-[9/16] overflow-hidden rounded-[1.35rem] shadow-[0_18px_50px_-24px_rgba(20,10,10,0.55)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_60px_-20px_rgba(20,10,10,0.45)] md:rounded-[1.75rem]",
          isLight ? "bg-[#f7f1e6] text-[#2a1f18]" : "bg-[#3a1218] text-white",
        )}
      >
        {/* Dark theme: full-bleed photo + gradient */}
        {!isLight && album.cover && (
          <ResponsiveImage
            image={album.cover}
            alt=""
            sizes={sizes}
            fill
            priority={priority}
            className="transition-transform duration-[1.1s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.05]"
          />
        )}
        {!isLight && (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-[#1a2a32]/55 via-[#3a1218]/45 to-[#2a0c12]/96"
          />
        )}

        {/* Light theme: double gold frame */}
        {isLight && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[6px] rounded-[1.1rem] border border-[#c9a46a]/55 md:inset-2 md:rounded-[1.4rem]"
          />
        )}

        <div className="absolute inset-0 flex flex-col items-center px-3 py-4 md:px-5 md:py-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <span
              aria-hidden
              className={cn(
                "mb-1.5 text-[0.7rem] leading-none md:mb-2 md:text-sm",
                accent,
              )}
            >
              ✦
            </span>
            <p
              className={cn(
                "text-[0.5rem] font-medium tracking-[0.26em] uppercase md:text-[0.62rem]",
                muted,
              )}
            >
              The {album.category?.trim() || "Wedding"} Celebration of
            </p>
          </div>

          {/* Light: arched photo */}
          {isLight && (
            <div className="relative mt-2.5 w-[68%] shrink-0 md:mt-3.5">
              <span
                aria-hidden
                className={cn(
                  "absolute -top-2 left-1/2 z-10 -translate-x-1/2 text-[0.65rem] md:-top-2.5 md:text-xs",
                  accent,
                )}
              >
                ◆
              </span>
              <div className="relative overflow-hidden rounded-t-full bg-[#ebe2d4] shadow-[inset_0_0_0_1.5px_#c9a46a]">
                <div className="relative aspect-[3/4]">
                  {album.cover ? (
                    <ResponsiveImage
                      image={album.cover}
                      alt={`${album.name} — cover photograph`}
                      sizes={sizes}
                      fill
                      priority={priority}
                      className="transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.05]"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Spacer pushes copy down on dark cards where photo is background */}
          {!isLight && <div className="min-h-[28%] flex-1" />}

          {/* Names + date + quote */}
          <div
            className={cn(
              "mt-auto flex w-full flex-col items-center px-0.5 text-center",
              isLight ? "pt-2.5" : "pt-0",
            )}
          >
            <h3 className="font-display text-[clamp(1rem,3.2vw,1.55rem)] leading-[1.05] tracking-[-0.03em]">
              <InvitationTitle name={album.name} ampClassName={accent} />
            </h3>

            <div className={cn("mt-2.5 flex w-full max-w-[85%] items-center gap-2 md:mt-3")}>
              <span aria-hidden className={cn("h-px flex-1", hairline)} />
              <span aria-hidden className={cn("text-[0.45rem]", accent)}>
                ✦
              </span>
              <span aria-hidden className={cn("h-px flex-1", hairline)} />
            </div>

            <p
              className={cn(
                "mt-2 text-[0.48rem] font-medium tracking-[0.14em] md:mt-2.5 md:text-[0.58rem]",
                muted,
              )}
            >
              {dateLine}
            </p>
            {album.photo_count > 0 && (
              <p className={cn("mt-0.5 text-[0.48rem] tracking-[0.12em] md:text-[0.55rem]", muted)}>
                {album.photo_count} photographs
              </p>
            )}

            <div className={cn("mt-2 flex w-full max-w-[85%] items-center gap-2 md:mt-2.5")}>
              <span aria-hidden className={cn("h-px flex-1", hairline)} />
            </div>

            <p
              className={cn(
                "mt-2 line-clamp-3 max-w-[95%] text-[0.58rem] leading-relaxed italic md:mt-2.5 md:text-[0.7rem]",
                muted,
              )}
            >
              “{quote}”
            </p>

            <div className={cn("mt-3 flex flex-col items-center gap-1.5 md:mt-4", muted)}>
              <span className="text-[0.48rem] tracking-[0.32em] uppercase md:text-[0.55rem]">
                Scroll
              </span>
              <span aria-hidden className={cn("h-4 w-px md:h-5", hairline)} />
            </div>
          </div>
        </div>
      </article>

      {/* Template-list caption under the phone frame */}
      <div className="mt-3 text-center md:mt-4">
        <p className="font-display text-base tracking-[-0.02em] md:text-xl">
          {album.name}
        </p>
        {album.category && (
          <p className="mt-0.5 text-xs text-muted-ink md:text-sm">{album.category}</p>
        )}
      </div>
    </Link>
  );
}

export function PackageCard({ pkg }: { pkg: PackageWithFeatures }) {
  const price = formatPrice(pkg.price, pkg.currency);
  const featured = pkg.is_featured;

  return (
    <article
      className={cn(
        "reveal flex h-full flex-col rounded-[1.75rem] p-7 md:p-9",
        featured ? "bg-ink text-paper" : "border border-line bg-paper",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-medium tracking-[-0.01em]">{pkg.name}</h3>
        {featured && <span className="text-xs opacity-70">Most loved</span>}
      </div>
      {price && (
        <p className="mt-8 font-display text-5xl tracking-[-0.03em] md:text-6xl">{price}</p>
      )}
      {pkg.duration && (
        <p className={cn("mt-2 text-sm", featured ? "opacity-70" : "text-muted-ink")}>
          {pkg.duration}
        </p>
      )}
      {pkg.description && (
        <p className={cn("mt-6 text-sm leading-relaxed", featured ? "opacity-80" : "text-muted-ink")}>
          {pkg.description}
        </p>
      )}
      {pkg.features.length > 0 && (
        <ul className="mt-6 space-y-2.5 text-sm">
          {pkg.features.map((f) => (
            <li key={f.id} className="flex gap-2.5">
              <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-current opacity-50" />
              {f.feature}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-10">
        <Link
          href={`/contact?package=${encodeURIComponent(pkg.name)}`}
          className={cn(
            "pill-btn w-full justify-center",
            featured ? "bg-paper text-ink hover:bg-paper/90" : "pill-btn-outline",
          )}
        >
          {pkg.cta_label || "Inquire"}
        </Link>
      </div>
    </article>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-[1.75rem] border border-line bg-paper p-7 md:p-9">
      <blockquote className="font-display text-xl leading-snug tracking-[-0.02em] md:text-2xl">
        “{testimonial.content}”
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-3">
        {testimonial.avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={testimonial.avatar.thumbnail_url}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            className="size-11 rounded-full object-cover"
          />
        )}
        <div>
          <p className="text-sm font-medium">{testimonial.name}</p>
          {testimonial.role && (
            <p className="mt-0.5 text-sm text-muted-ink">{testimonial.role}</p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

export function TestimonialList({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <ul className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
      {testimonials.map((t) => (
        <li key={t.id} className="w-[85%] shrink-0 snap-start md:w-auto">
          <TestimonialCard testimonial={t} />
        </li>
      ))}
    </ul>
  );
}

export function ContactCta({
  title = "Every moment matters.",
  subtitle = "Worth remembering. Worth preserving.",
  availability,
  images,
}: {
  title?: string;
  subtitle?: string;
  availability?: string | null;
  images?: { url: string; alt: string }[];
}) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="reveal relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-paper md:rounded-[2.5rem] md:px-14 md:py-20">
          <div className="relative z-10 mx-auto max-w-xl text-center">
            <StatusBadge label={availability?.trim() || "Open for shoots"} />
            <h2 className="mt-6 font-display text-4xl tracking-[-0.03em] text-balance md:text-5xl lg:text-6xl">
              {title}
            </h2>
            <p className="mt-4 text-base text-paper/70">{subtitle}</p>
            <PillLink href="/contact" className="mt-8 bg-paper text-ink hover:bg-paper/90">
              Tell Your Story
            </PillLink>
          </div>

          {images && images.length > 0 && (
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute -bottom-8 -left-4 flex gap-3 md:gap-4">
                {images.slice(0, 2).map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.url}
                    src={img.url}
                    alt=""
                    className="h-36 w-28 rounded-2xl object-cover md:h-48 md:w-36"
                  />
                ))}
              </div>
              <div className="absolute -right-4 -bottom-8 flex gap-3 md:gap-4">
                {images.slice(2, 4).map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.url}
                    src={img.url}
                    alt=""
                    className="h-36 w-28 rounded-2xl object-cover md:h-48 md:w-36"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-line py-20 text-center text-muted-ink">
      {children}
    </div>
  );
}
