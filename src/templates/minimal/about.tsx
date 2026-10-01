import { ResponsiveImage } from "@/components/site/responsive-image";
import { paragraphs } from "@/lib/format";
import type { AboutPageProps } from "@/templates/types";
import {
  ContactCta,
  Container,
  PillLink,
  SectionHeading,
  SectionLabel,
  TestimonialList,
} from "./components";

export function MinimalAboutPage({ site, testimonials }: AboutPageProps) {
  const { about, socialLinks, contact } = site;
  const bio = paragraphs(about.biography);
  const experience = paragraphs(about.experience);

  return (
    <>
      <Container className="grid gap-12 pt-28 pb-20 md:grid-cols-12 md:gap-10 md:pt-36 md:pb-28">
        <div className="md:col-span-5">
          <div className="fade-up relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-veil md:sticky md:top-28 md:rounded-[2.5rem]">
            {about.profile_image && (
              <ResponsiveImage
                image={about.profile_image}
                alt={`Portrait of ${about.name}`}
                sizes="(min-width: 768px) 40vw, 100vw"
                fill
                priority
              />
            )}
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <SectionLabel className="fade-up">About</SectionLabel>
          <h1 className="fade-up mt-5 font-display text-5xl tracking-[-0.035em] [animation-delay:100ms] md:text-6xl lg:text-7xl">
            {about.name}
          </h1>
          {about.headline && (
            <p className="fade-up mt-3 text-lg text-muted-ink [animation-delay:160ms] md:text-xl">
              {about.headline}
            </p>
          )}
          {about.introduction && (
            <p className="fade-up mt-8 text-base leading-relaxed [animation-delay:220ms] md:text-lg">
              {about.introduction}
            </p>
          )}

          {bio.length > 0 && (
            <div className="mt-8 space-y-5 text-[0.975rem] leading-relaxed text-muted-ink">
              {bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          {(about.years_experience || experience.length > 0) && (
            <section className="reveal mt-14 rounded-[1.5rem] border border-line p-7">
              <h2 className="text-sm font-medium text-muted-ink">Experience</h2>
              {about.years_experience ? (
                <p className="mt-4 font-display text-5xl tracking-[-0.03em]">
                  {about.years_experience}
                  <span className="ml-3 align-middle font-body text-sm tracking-normal text-muted-ink">
                    years behind the lens
                  </span>
                </p>
              ) : null}
              {experience.length > 0 && (
                <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-ink">
                  {experience.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </section>
          )}

          {about.specialties.length > 0 && (
            <section className="reveal mt-10">
              <h2 className="text-sm font-medium text-muted-ink">Specialties</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {about.specialties.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border border-line px-4 py-2 text-sm font-medium"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {about.personal_message && (
            <blockquote className="reveal mt-12 border-l-2 border-ink/20 pl-5 font-display text-2xl leading-snug tracking-[-0.02em] md:text-3xl">
              {about.personal_message}
            </blockquote>
          )}

          <div className="reveal mt-12 flex flex-wrap items-center gap-3">
            <PillLink href="/contact">Let’s Talk</PillLink>
            {socialLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-btn pill-btn-outline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </Container>

      {testimonials.length > 0 && (
        <section className="py-20 md:py-28">
          <Container>
            <SectionHeading
              label="Kind words"
              title="What clients say"
              description="Stories from the people I’ve had the privilege to photograph."
            />
            <div className="mt-12">
              <TestimonialList testimonials={testimonials} />
            </div>
          </Container>
        </section>
      )}

      <ContactCta availability={contact.availability} />
    </>
  );
}
